/**
 * "Ask Vishnu AI" proxy — the only place the Gemini key exists.
 *
 * The browser never talks to Google directly: GEMINI_API_KEY has no VITE_
 * prefix, so Vite cannot inline it into the bundle. This endpoint holds it,
 * checks the origin, enforces the 10-questions-per-visitor-per-day quota, and
 * streams the answer back as newline-delimited JSON.
 *
 * Protocol
 *   GET  /api/chat            → { limit, remaining, resetsAt } (costs nothing)
 *   POST /api/chat            → NDJSON stream: {"d":"delta"}\n ... {"done":true}
 *        429                  → { error: "quota_exceeded", ... }
 *
 * Quota is spent only after Google accepts the request, so a failed call or a
 * retry never costs the visitor a question.
 */

import { buildSystemPrompt } from '../src/data/ai/knowledge.js';
import {
  DAILY_LIMIT,
  GLOBAL_DAILY_LIMIT,
  globalKey,
  incrCount,
  quotaHeaders,
  readCount,
  resetsAt,
  visitorId,
  visitorKey,
} from './_lib/quota.js';

export const config = { runtime: 'edge' };

// Pinned rather than `gemini-flash-latest` so answers can't shift under you
// without a deploy. Verified 2026-08-15: gemini-2.5-flash is closed to new keys.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
// Overridable so the streaming path can be exercised against a local mock.
const BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
const ENDPOINT = (model) =>
  `${BASE_URL}/v1beta/models/${model}:streamGenerateContent?alt=sse`;

const MAX_INPUT_CHARS = 500;
const MAX_TURNS = 8;

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });

/** Same-origin and localhost always pass; ALLOWED_ORIGINS adds any extras. */
function originAllowed(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // same-origin GET, curl, health checks

  try {
    const url = new URL(origin);
    const host = request.headers.get('host') || new URL(request.url).host;
    if (url.host === host) return true;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true;

    const extra = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return extra.includes(origin) || extra.includes(url.host);
  } catch {
    return false;
  }
}

/** @param {unknown} messages */
function toGeminiContents(messages) {
  return messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content.slice(0, MAX_INPUT_CHARS * 4) }],
    }));
}

/**
 * Re-emit Gemini's SSE frames as NDJSON deltas. One line per chunk keeps the
 * client parser trivial and survives chunk boundaries mid-JSON.
 */
function streamAnswer(upstream) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      const emit = (obj) => controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));

      const consume = (line) => {
        if (!line.startsWith('data:')) return;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') return;
        try {
          const parsed = JSON.parse(payload);
          const parts = parsed?.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part?.text) emit({ d: part.text });
          }
        } catch {
          // A partial frame — the next chunk completes it.
        }
      };

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) consume(line);
        }
        // The last frame often arrives without a trailing newline — flushing
        // here is what stops the final sentence being cut off mid-word.
        consume(buffer);
        emit({ done: true });
      } catch (err) {
        emit({ error: 'stream_failed', message: String(err?.message || err) });
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

export default async function handler(request) {
  if (!originAllowed(request)) return json({ error: 'forbidden_origin' }, 403);

  const id = await visitorId(request);
  const key = visitorKey(id);

  if (request.method === 'GET') {
    const used = await readCount(key);
    return json(
      { limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used), resetsAt: resetsAt() },
      200,
      quotaHeaders(DAILY_LIMIT - used),
    );
  }

  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  /** @type {{ messages?: Array<{role: string, content: string}> }} */
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const latest = messages[messages.length - 1];
  if (!latest || latest.role !== 'user' || !String(latest.content || '').trim()) {
    return json({ error: 'bad_request' }, 400);
  }
  if (String(latest.content).length > MAX_INPUT_CHARS) {
    return json({ error: 'too_long', max: MAX_INPUT_CHARS }, 413);
  }

  // --- quota: check before spending -----------------------------------------
  const used = await readCount(key);
  if (used >= DAILY_LIMIT) {
    return json(
      { error: 'quota_exceeded', remaining: 0, limit: DAILY_LIMIT, resetsAt: resetsAt() },
      429,
      quotaHeaders(0),
    );
  }

  const globalUsed = await readCount(globalKey());
  if (globalUsed >= GLOBAL_DAILY_LIMIT) {
    return json({ error: 'global_limit', resetsAt: resetsAt() }, 503, quotaHeaders(DAILY_LIMIT - used));
  }

  // --- upstream --------------------------------------------------------------
  let upstream;
  try {
    upstream = await fetch(ENDPOINT(MODEL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
        contents: toGeminiContents(messages),
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 400,
          // 2.5 Flash is a thinking model and reasoning tokens count against
          // maxOutputTokens — without this the 400-token budget can be spent
          // thinking and the answer comes back empty.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
  } catch (err) {
    return json({ error: 'upstream_unreachable', message: String(err?.message || err) }, 502);
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    // Logged for the operator; never returned to the browser (it can echo the key).
    console.error('[chat] gemini error', upstream.status, detail.slice(0, 400));
    // Google's own rate limiting (429) and overload (503) are transient: report
    // them as "busy" so the client falls back to the FAQ for this one question
    // instead of latching into offline mode.
    if (upstream.status === 429 || upstream.status === 503) return json({ error: 'busy' }, 503);
    return json({ error: 'upstream_error', status: upstream.status }, 502);
  }

  // Google accepted it — now it costs a question.
  const count = await incrCount(key);
  incrCount(globalKey()).catch(() => {});

  return new Response(streamAnswer(upstream.body), {
    status: 200,
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
      ...quotaHeaders(DAILY_LIMIT - count),
    },
  });
}
