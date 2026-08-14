/**
 * The only module that knows how the chat talks to a server.
 *
 * Transport is `/api/chat` on our own origin — never Google directly, because
 * the Gemini key lives server-side. Responses are newline-delimited JSON:
 *   {"d":"partial text"}\n  ...  {"done":true}\n
 */

const ENDPOINT = '/api/chat';

/** Error with a machine-readable `code` so the UI can pick the right copy. */
export class ChatError extends Error {
  constructor(code, message, meta = {}) {
    super(message || code);
    this.name = 'ChatError';
    this.code = code;
    Object.assign(this, meta);
  }
}

function readQuotaHeaders(res) {
  const remaining = res.headers.get('X-Chat-Remaining');
  const limit = res.headers.get('X-Chat-Limit');
  const resetsAt = res.headers.get('X-Chat-Resets-At');
  if (remaining === null && limit === null) return null;
  return {
    remaining: remaining === null ? null : Number(remaining),
    limit: limit === null ? 10 : Number(limit),
    resetsAt,
  };
}

/**
 * Current quota without spending a question. Used when the panel first opens.
 * @returns {Promise<{limit:number, remaining:number, resetsAt:string}>}
 */
export async function fetchQuota(signal) {
  const res = await fetch(ENDPOINT, { method: 'GET', signal });
  if (!res.ok) throw new ChatError('quota_unavailable', `status ${res.status}`);
  return res.json();
}

/**
 * Send the conversation and stream the answer back.
 *
 * @param {Object} params
 * @param {Array<{role: 'user'|'assistant', content: string}>} params.messages
 * @param {(delta: string) => void} params.onDelta
 * @param {(quota: {remaining:number|null, limit:number, resetsAt:string|null}) => void} [params.onQuota]
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<string>} the complete answer
 */
export async function streamChat({ messages, onDelta, onQuota, signal }) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ChatError('offline', 'Could not reach the server');
  }

  const quota = readQuotaHeaders(res);
  if (quota && onQuota) onQuota(quota);

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    if (res.status === 429) {
      throw new ChatError('quota_exceeded', 'Daily limit reached', {
        resetsAt: detail.resetsAt || quota?.resetsAt || null,
      });
    }
    if (res.status === 503 && detail.error === 'not_configured') {
      throw new ChatError('not_configured', 'The assistant is not configured yet');
    }
    if (res.status === 503) throw new ChatError('busy', 'The assistant is resting');
    if (res.status === 413) throw new ChatError('too_long', 'That message is too long');
    throw new ChatError('upstream', `status ${res.status}`);
  }

  if (!res.body) throw new ChatError('upstream', 'Empty response');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  const consume = (line) => {
    if (!line.trim()) return;
    let frame;
    try {
      frame = JSON.parse(line);
    } catch {
      return; // ignore a malformed frame rather than killing the answer
    }
    if (frame.error) throw new ChatError('stream_failed', frame.message);
    if (typeof frame.d === 'string') {
      full += frame.d;
      onDelta(frame.d);
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) consume(line);
  }
  consume(buffer);

  if (!full.trim()) throw new ChatError('empty', 'The model returned nothing');
  return full;
}
