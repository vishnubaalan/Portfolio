#!/usr/bin/env node
/**
 * Regression coverage for api/chat.js's primary→fallback failover.
 *
 * The repo has no test framework (no vitest/jest anywhere, no `test` script)
 * — adding one just for this would be its own scope creep. Plain assertions,
 * a mocked global `fetch`, and the real handler, imported and invoked exactly
 * as Vercel would invoke it. Same style as scripts/prerender.mjs: a plain
 * node script, not a new abstraction.
 *
 * Run with: node scripts/test-chat-fallback.mjs
 */
import assert from 'node:assert/strict';

process.env.GEMINI_API_KEY = 'test-key';
process.env.QUOTA_SALT = 'test-salt';
// Force the in-memory quota store — a KV pair present in the shell running
// this would make the test hit a real network endpoint.
delete process.env.KV_REST_API_URL;
delete process.env.KV_REST_API_TOKEN;
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
// Exercise the real default models, the same ones production uses.
delete process.env.GEMINI_MODEL;
delete process.env.GEMINI_FALLBACK_MODEL;

const PRIMARY = 'gemini-3.7-flash';
const FALLBACK = 'gemini-3.6-flash';

// api/chat.js imports source modules through the extensionless paths Vite
// resolves (e.g. `../projects` → `projects.js`) — plain Node ESM can't load
// that directly. Rather than add a loader dependency, use the `vite` package
// this repo already has to resolve and load it exactly as the real dev/build
// pipeline does.
const { createServer } = await import('vite');
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'warn' });
const { default: handler } = await vite.ssrLoadModule('/api/chat.js');

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

/** An SSE body shaped exactly like Gemini's real streamGenerateContent frames. */
function sseBody(text) {
  const frame = `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] })}\n\n`;
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(frame));
      controller.close();
    },
  });
}

const okResponse = (text) => new Response(sseBody(text), { status: 200 });
const errorResponse = (status, body = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** A rejection shaped exactly like what AbortSignal.timeout produces on fetch. */
function timeoutError() {
  const err = new Error('The operation timed out.');
  err.name = 'TimeoutError';
  return err;
}

/**
 * Installs a mock fetch that dispatches on which model's URL was hit, counts
 * calls per model so tests can assert whether the fallback ran at all, and
 * records the last request body sent to each model so tests can assert on
 * the actual generationConfig sent — this is what would have caught the
 * thinkingBudget:0 vs. gemini-3.6-flash bug before production did.
 * @param {{ primary?: (url: string) => Promise<Response>, fallback?: (url: string) => Promise<Response> }} handlers
 */
function mockFetch({ primary, fallback }) {
  const calls = { [PRIMARY]: 0, [FALLBACK]: 0 };
  const bodies = { [PRIMARY]: null, [FALLBACK]: null };
  globalThis.fetch = async (url, init) => {
    const isPrimary = String(url).includes(`models/${PRIMARY}:`);
    const isFallback = String(url).includes(`models/${FALLBACK}:`);
    assert.ok(isPrimary || isFallback, `unexpected model URL: ${url}`);
    const model = isPrimary ? PRIMARY : FALLBACK;
    calls[model] += 1;
    bodies[model] = JSON.parse(init.body);
    if (isPrimary) return primary(url);
    return fallback ? fallback(url) : primary(url);
  };
  return { calls, bodies };
}

function req() {
  return new Request('https://example.test/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
  });
}

/** Drains the NDJSON body into the plain text a real client would show. */
async function readAnswer(response) {
  const text = await response.text();
  return text
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line))
    .filter((frame) => typeof frame.d === 'string')
    .map((frame) => frame.d)
    .join('');
}

/* -------------------------------------------------------------------- tests */

test('primary succeeds: fallback is never called', async () => {
  const { calls } = mockFetch({ primary: async () => okResponse('primary answer') });

  const res = await handler(req());

  assert.equal(res.status, 200);
  assert.equal(await readAnswer(res), 'primary answer');
  assert.equal(calls[PRIMARY], 1);
  assert.equal(calls[FALLBACK], 0);
});

test('primary 503: fallback is invoked and its answer is returned', async () => {
  const { calls } = mockFetch({
    primary: async () => errorResponse(503, { error: { status: 'UNAVAILABLE' } }),
    fallback: async () => okResponse('fallback answer'),
  });

  const res = await handler(req());

  assert.equal(res.status, 200);
  assert.equal(await readAnswer(res), 'fallback answer');
  assert.equal(calls[PRIMARY], 1);
  assert.equal(calls[FALLBACK], 1);
});

test('primary times out: fallback is invoked and its answer is returned', async () => {
  const { calls } = mockFetch({
    primary: async () => {
      throw timeoutError();
    },
    fallback: async () => okResponse('fallback after timeout'),
  });

  const res = await handler(req());

  assert.equal(res.status, 200);
  assert.equal(await readAnswer(res), 'fallback after timeout');
  assert.equal(calls[PRIMARY], 1);
  assert.equal(calls[FALLBACK], 1);
});

test('primary 429: transient-error policy sends it to the fallback', async () => {
  const { calls } = mockFetch({
    primary: async () => errorResponse(429, { error: { status: 'RESOURCE_EXHAUSTED' } }),
    fallback: async () => okResponse('fallback after 429'),
  });

  const res = await handler(req());

  assert.equal(res.status, 200);
  assert.equal(await readAnswer(res), 'fallback after 429');
  assert.equal(calls[PRIMARY], 1);
  assert.equal(calls[FALLBACK], 1);
});

test('primary auth/config error (401): fallback is NOT invoked', async () => {
  const { calls } = mockFetch({
    primary: async () => errorResponse(401, { error: { status: 'UNAUTHENTICATED' } }),
    fallback: async () => okResponse('should never be seen'),
  });

  const res = await handler(req());
  const body = await res.json();

  assert.equal(calls[PRIMARY], 1);
  assert.equal(calls[FALLBACK], 0, 'fallback must not run for a config/auth error');
  assert.equal(res.status, 502);
  assert.equal(body.error, 'upstream_error');
  assert.equal(body.status, 401);
});

test('both models fail (503/503): clean error, no further retry', async () => {
  const { calls } = mockFetch({
    primary: async () => errorResponse(503, {}),
    fallback: async () => errorResponse(503, {}),
  });

  const res = await handler(req());
  const body = await res.json();

  assert.equal(calls[PRIMARY], 1);
  assert.equal(calls[FALLBACK], 1, 'exactly one fallback attempt — never a chain');
  assert.equal(res.status, 503);
  assert.equal(body.error, 'busy');
});

test('both models time out: clean 504, no infinite loop', async () => {
  const { calls } = mockFetch({
    primary: async () => {
      throw timeoutError();
    },
    fallback: async () => {
      throw timeoutError();
    },
  });

  const res = await handler(req());
  const body = await res.json();

  assert.equal(calls[PRIMARY], 1);
  assert.equal(calls[FALLBACK], 1);
  assert.equal(res.status, 504);
  assert.equal(body.error, 'upstream_timeout');
});

test('fallback request never sends thinkingBudget: 0 (gemini-3.6-flash rejects it — reproduced 2026-08-22)', async () => {
  const { bodies } = mockFetch({
    primary: async () => errorResponse(503, {}),
    fallback: async () => okResponse('fallback answer'),
  });

  await handler(req());

  const primaryThinking = bodies[PRIMARY]?.generationConfig?.thinkingConfig?.thinkingBudget;
  const fallbackThinking = bodies[FALLBACK]?.generationConfig?.thinkingConfig?.thinkingBudget;

  assert.equal(primaryThinking, 0, 'primary is expected to disable thinking');
  assert.notEqual(fallbackThinking, 0, 'fallback must not send thinkingBudget: 0 — gemini-3.6-flash 400s on it');
});

test('quota is charged exactly once even though two models were tried', async () => {
  mockFetch({
    primary: async () => errorResponse(503, {}),
    fallback: async () => okResponse('counts once'),
  });

  const before = await handler(req());
  const beforeRemaining = Number(before.headers.get('X-Chat-Remaining'));

  mockFetch({ primary: async () => okResponse('second question') });
  const after = await handler(req());
  const afterRemaining = Number(after.headers.get('X-Chat-Remaining'));

  assert.equal(beforeRemaining - afterRemaining, 1, 'one question, one charge — not two');
});

/* --------------------------------------------------------------------- run */

let failed = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(`     ${err.message}`);
  }
}

console.log(`\n${tests.length - failed}/${tests.length} passed`);
await vite.close();
process.exit(failed ? 1 : 0);
