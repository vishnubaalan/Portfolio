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
// Tried once, only when the primary fails transiently (busy/overloaded/timed
// out) — never chained further. Confirmed callable with the production key
// 2026-08-21 (200 in ~2s). Same env-override convention as MODEL, so a bad
// default here can be fixed without a redeploy.
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.6-flash';
// Overridable so the streaming path can be exercised against a local mock.
const BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
const ENDPOINT = (model) =>
  `${BASE_URL}/v1beta/models/${model}:streamGenerateContent?alt=sse`;

const MAX_INPUT_CHARS = 500;
const MAX_TURNS = 8;

// The primary keeps its full 20s: a genuinely hung model needs that long to
// be told apart from one that's merely slow. The fallback gets far less,
// because a second full 20s stacked on top of a primary that just spent its
// whole budget hanging would land close to or past Vercel's own platform-level
// function timeout (~25s, confirmed directly against this deployment on
// 2026-08-21: a 504 with x-vercel-error: FUNCTION_INVOCATION_TIMEOUT at ~25.4s)
// — turning "resilience" back into the exact opaque, undiagnosable 504 this
// exists to avoid. 8s is generous for a model that (unlike the primary, which
// just failed) is presumably not the one currently overloaded.
const PRIMARY_TIMEOUT_MS = 20_000;
const FALLBACK_TIMEOUT_MS = 8_000;

// The two models do not accept the same generationConfig — reproduced
// directly against the production key 2026-08-22, not assumed:
//   gemini-3.7-flash: thinkingConfig.thinkingBudget: 0 works — thinking is
//     fully disabled, so the whole token budget goes to the answer.
//   gemini-3.6-flash: the same field is REJECTED outright (400
//     INVALID_ARGUMENT) — this model cannot disable thinking. Omitting
//     thinkingConfig (dynamic thinking) is what it accepts instead, but
//     thinking tokens then compete with the answer for maxOutputTokens (a
//     trivial "reply OK" burned 34-53 tokens on thinking alone), so its
//     budget is raised to leave room for both. This is a mitigation, not a
//     guarantee — a long, complex reply could still be thought-token-starved
//     on the fallback in a way it never would be on the primary.
const PRIMARY_GENERATION_CONFIG = {
  temperature: 0.4,
  maxOutputTokens: 400,
  thinkingConfig: { thinkingBudget: 0 },
};
const FALLBACK_GENERATION_CONFIG = {
  temperature: 0.4,
  maxOutputTokens: 800,
};

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
 * One attempt against one model, with its own deadline.
 *
 * Classifies the outcome rather than throwing, so the caller can decide
 * "worth a fallback?" without a second layer of try/catch. `transient` is the
 * whole point of this function: only 503/429/timeout/network-failure set it,
 * and only those ever trigger a retry against the fallback model. A bad key,
 * a malformed request, or an unknown model comes back with `transient: false`
 * — retrying that against a different model would still fail identically and
 * would hide a real configuration bug behind a "the assistant is busy"
 * message instead of surfacing it.
 *
 * @param {string} model
 * @param {string} apiKey
 * @param {Array} messages
 * @param {number} timeoutMs
 * @param {object} generationConfig model-specific — see the constants above
 * @returns {Promise<
 *   | { ok: true, response: Response }
 *   | { ok: false, transient: true, reason: 'timeout' | 'unreachable' | 'upstream', status?: number, detail?: string }
 *   | { ok: false, transient: false, reason: 'upstream', status: number, detail?: string }
 * >}
 */
async function callGemini(model, apiKey, messages, timeoutMs, generationConfig) {
  let response;
  try {
    response = await fetch(ENDPOINT(model), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
        contents: toGeminiContents(messages),
        generationConfig,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      return { ok: false, transient: true, reason: 'timeout' };
    }
    // A raw network failure (DNS, connection refused, TLS) isn't a
    // configuration problem on our side, and the fallback shares nothing
    // with the primary that would make it fail the same way — worth the
    // one retry the caller allows.
    return { ok: false, transient: true, reason: 'unreachable', detail: String(err?.message || err) };
  }

  if (response.ok && response.body) {
    return { ok: true, response };
  }

  const detail = await response.text().catch(() => '');
  const transient = response.status === 503 || response.status === 429;
  return { ok: false, transient, reason: 'upstream', status: response.status, detail };
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

  // --- upstream, with one fallback on a transient failure --------------------
  // Without an explicit deadline, a slow or hung Gemini response doesn't fail
  // — it hangs until the platform kills the whole function at its own
  // execution limit (~25s), which the browser sees as a bare 504 with no body
  // and no way to distinguish it from a deployment problem. Aborting first
  // keeps the failure inside this handler's own error handling instead.
  let attempt = await callGemini(MODEL, apiKey, messages, PRIMARY_TIMEOUT_MS, PRIMARY_GENERATION_CONFIG);

  if (!attempt.ok && attempt.transient) {
    console.error('[chat] primary model %s failed transiently (%s%s) — trying fallback %s', MODEL,
      attempt.reason, attempt.status ? ` ${attempt.status}` : '', FALLBACK_MODEL);
    attempt = await callGemini(FALLBACK_MODEL, apiKey, messages, FALLBACK_TIMEOUT_MS, FALLBACK_GENERATION_CONFIG);
  }

  if (!attempt.ok) {
    // Logged for the operator; never returned to the browser (it can echo the key).
    console.error('[chat] gemini failed', attempt.reason, attempt.status ?? '', (attempt.detail || '').slice(0, 400));
    if (attempt.reason === 'timeout') return json({ error: 'upstream_timeout' }, 504);
    // Google's own rate limiting (429), overload (503), and a network-level
    // failure to reach it are all transient: report them as "busy" so the
    // client falls back to the FAQ for this one question instead of latching
    // into offline mode. Anything else (bad key, malformed request, unknown
    // model) is a real configuration/programming error and is reported as
    // such rather than being hidden behind the same "busy" message.
    if (attempt.transient) return json({ error: 'busy' }, 503);
    return json({ error: 'upstream_error', status: attempt.status }, 502);
  }

  const upstream = attempt.response;

  // Google accepted it — now it costs a question. Charged once, for whichever
  // model actually answered, never per attempt.
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
