/**
 * Per-visitor daily quota for the portfolio chat.
 *
 * Storage is pluggable so the feature ships without any account setup:
 *   - Upstash / Vercel KV REST when KV_REST_API_URL + KV_REST_API_TOKEN (or the
 *     UPSTASH_REDIS_REST_* pair) are present. This is the real enforcement.
 *   - An in-memory Map otherwise. Per-isolate and short-lived, so it is a
 *     development and cold-start fallback only — set up KV before launch.
 *
 * Nothing personal is persisted: the key is a salted hash of IP + user agent,
 * the value is an integer, and message content never touches this module.
 *
 * Files under api/_lib are ignored by Vercel's function builder.
 */

export const DAILY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT || 10);
export const GLOBAL_DAILY_LIMIT = Number(process.env.CHAT_GLOBAL_DAILY_LIMIT || 500);

/** Keys outlive the IST day they belong to, then expire on their own. */
const TTL_SECONDS = 26 * 60 * 60;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const quotaStore = REST_URL && REST_TOKEN ? 'kv' : 'memory';

/** The day resets at 00:00 IST — one timezone everyone reading the counter shares. */
export function istDayKey(now = Date.now()) {
  return new Date(now + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** ISO instant of the next 00:00 IST. */
export function resetsAt(now = Date.now()) {
  const shifted = new Date(now + IST_OFFSET_MS);
  const nextMidnight = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() + 1,
  );
  return new Date(nextMidnight - IST_OFFSET_MS).toISOString();
}

/**
 * Stable, non-reversible visitor id. No raw IP is stored anywhere.
 * @param {Request} request
 */
export async function visitorId(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  const salt = process.env.QUOTA_SALT || 'vb-portfolio-chat';

  const bytes = new TextEncoder().encode(`${ip}|${ua}|${salt}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

/* ------------------------------------------------------------------ store -- */

const memory = new Map();

function memoryGet(key) {
  const hit = memory.get(key);
  if (!hit) return 0;
  if (hit.expires < Date.now()) {
    memory.delete(key);
    return 0;
  }
  return hit.count;
}

function memoryIncr(key) {
  const count = memoryGet(key) + 1;
  memory.set(key, { count, expires: Date.now() + TTL_SECONDS * 1000 });
  return count;
}

async function kvPipeline(commands) {
  const res = await fetch(`${REST_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`kv ${res.status}`);
  return res.json();
}

/**
 * Read a counter without spending anything.
 * @returns {Promise<number>}
 */
export async function readCount(key) {
  if (quotaStore === 'memory') return memoryGet(key);
  try {
    const out = await kvPipeline([['GET', key]]);
    return Number(out?.[0]?.result || 0);
  } catch {
    // A dead KV must never take the chat down with it.
    return memoryGet(key);
  }
}

/**
 * Spend one unit. Called only after the upstream model call succeeds, so a
 * failed request never costs the visitor a question.
 * @returns {Promise<number>} the new count
 */
export async function incrCount(key) {
  if (quotaStore === 'memory') return memoryIncr(key);
  try {
    const out = await kvPipeline([
      ['INCR', key],
      ['EXPIRE', key, TTL_SECONDS],
    ]);
    return Number(out?.[0]?.result || 1);
  } catch {
    return memoryIncr(key);
  }
}

export const visitorKey = (id, day = istDayKey()) => `q:${id}:${day}`;
export const globalKey = (day = istDayKey()) => `q:global:${day}`;

/**
 * Quota headers every chat response carries. The client overwrites its local
 * mirror with these — the server is the source of truth.
 */
export function quotaHeaders(remaining, limit = DAILY_LIMIT) {
  return {
    'X-Chat-Remaining': String(Math.max(0, remaining)),
    'X-Chat-Limit': String(limit),
    'X-Chat-Resets-At': resetsAt(),
    'X-Chat-Quota-Store': quotaStore,
  };
}
