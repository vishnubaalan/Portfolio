/**
 * Buffering and delivery of recorded events.
 *
 * Everything expensive happens here rather than in the recorder: rrweb emits
 * hundreds of events a minute and posting each one would be both slow and a
 * good way to get rate-limited by your own endpoint.
 *
 * Flush triggers — whichever comes first:
 *   - 150 rrweb events buffered
 *   - 10 seconds elapsed
 *   - the tab is hidden or being unloaded  (via `sendBeacon`, which survives it)
 *
 * The payload is gzipped in the browser with CompressionStream. rrweb output is
 * highly repetitive JSON and compresses 10–20×, which is the difference between
 * this fitting in a free storage tier and not.
 */

const FLUSH_EVENT_COUNT = 150;
const FLUSH_INTERVAL_MS = 10000;
const MAX_BUFFER_EVENTS = 2000;

export function createTransport({ endpoint, writeKey, sessionId, startedAt, getStats, self = false }) {
  /** @type {any[]} */
  let events = [];
  /** @type {any[]} */
  let custom = [];
  /** @type {any[]} */
  let clicks = [];

  let seq = 0;
  let timer = null;
  let flushing = false;
  let disposed = false;

  const meta = {
    entryPath: location.pathname,
    referrer: document.referrer || '',
    viewportW: window.innerWidth,
    viewportH: window.innerHeight,
    self,
  };

  const buildPayload = () => ({
    sessionId,
    seq,
    startedAt,
    meta,
    stats: getStats(),
    events: custom,
    clicks,
    rrweb: events,
  });

  async function gzip(text) {
    const encoded = new TextEncoder().encode(text);
    const stream = new Blob([encoded]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Blob([await new Response(stream).arrayBuffer()]);
  }

  /**
   * @param {boolean} beacon use sendBeacon — required on pagehide, where fetch
   *   is not guaranteed to complete.
   */
  async function flush(beacon = false) {
    if (disposed || flushing) return;
    if (!events.length && !custom.length) return;

    const payload = buildPayload();
    // Cleared before the request, not after: a flush that fails must not replay
    // the same events into the next one, or a single bad response duplicates
    // the whole session.
    const sent = { events: events.length, custom: custom.length };
    events = [];
    custom = [];
    clicks = [];
    seq += 1;

    flushing = true;
    try {
      const body = await gzip(JSON.stringify(payload));

      if (beacon && navigator.sendBeacon) {
        // sendBeacon cannot set headers, so the key and the gzip flag ride on
        // the query string, and the Blob type must stay CORS-safelisted or the
        // browser will try a preflight it cannot perform.
        const url = `${endpoint}?k=${encodeURIComponent(writeKey)}&z=1`;
        navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
        return;
      }

      await fetch(endpoint, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Write-Key': writeKey,
          'X-Vb-Encoding': 'gzip',
        },
        body,
      });
    } catch {
      // Analytics must never surface an error to a visitor, and must never
      // retry hard enough to matter. The session simply loses this chunk.
      void sent;
    } finally {
      flushing = false;
    }
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => flush(false), FLUSH_INTERVAL_MS);
  }

  return {
    /** @param {any} event an rrweb event */
    push(event) {
      if (disposed) return;
      events.push(event);

      // A hard ceiling in case a flush is failing: an unbounded buffer on a
      // page left open overnight is a memory leak with a visitor attached.
      if (events.length > MAX_BUFFER_EVENTS) events.splice(0, events.length - MAX_BUFFER_EVENTS);
      if (events.length >= FLUSH_EVENT_COUNT) flush(false);
      else schedule();
    },

    /** @param {{name: string, path?: string, tMs: number, props?: object}} event */
    track(event) {
      if (disposed) return;
      custom.push(event);
    },

    /** @param {{t: number, x: number, y: number}} click */
    click(click) {
      if (disposed) return;
      clicks.push(click);
    },

    flush,

    dispose() {
      disposed = true;
      clearTimeout(timer);
    },
  };
}
