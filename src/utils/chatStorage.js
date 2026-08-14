/**
 * localStorage for the chat: conversation history, the quota mirror, and the
 * one-time UI flags (disclosure dismissed, first-visit hint shown).
 *
 * The quota stored here is a MIRROR for instant UX only — the server is the
 * source of truth and every response overwrites it. Clearing storage buys
 * nobody extra questions.
 *
 * Every access is guarded: Safari private mode and disabled storage throw.
 */

const HISTORY_KEY = 'vb_chat_history';
const QUOTA_KEY = 'vb_chat_quota';
const FLAGS_KEY = 'vb_chat_flags';

/** Keep the thread useful across a refresh without bloating storage. */
const MAX_PERSISTED = 20;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Must match the server's day boundary (00:00 IST). */
export function istDayKey(now = Date.now()) {
  return new Date(now + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — the feature degrades to session-only, which is fine.
  }
}

export function loadHistory() {
  const stored = read(HISTORY_KEY, []);
  return Array.isArray(stored) ? stored.filter((m) => m && m.role && m.content) : [];
}

export function saveHistory(messages) {
  write(
    HISTORY_KEY,
    messages
      .filter((m) => !m.streaming && !m.error)
      .slice(-MAX_PERSISTED)
      .map(({ id, role, content, source }) => ({ id, role, content, source })),
  );
}

export function clearHistory() {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

/** @returns {{remaining: number|null, limit: number, resetsAt: string|null}} */
export function loadQuota(defaultLimit = 10) {
  const stored = read(QUOTA_KEY, null);
  if (!stored || stored.date !== istDayKey()) {
    return { remaining: null, limit: defaultLimit, resetsAt: null };
  }
  return {
    remaining: typeof stored.remaining === 'number' ? stored.remaining : null,
    limit: stored.limit || defaultLimit,
    resetsAt: stored.resetsAt || null,
  };
}

export function saveQuota({ remaining, limit, resetsAt }) {
  write(QUOTA_KEY, { date: istDayKey(), remaining, limit, resetsAt });
}

export function loadFlags() {
  return read(FLAGS_KEY, { disclosureDismissed: false, hintShown: false });
}

export function saveFlags(flags) {
  write(FLAGS_KEY, flags);
}
