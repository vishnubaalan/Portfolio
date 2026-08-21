/**
 * The recorder. Starts rrweb, tracks engagement, ships everything to the
 * analytics endpoint.
 *
 * Three rules govern how this loads, and all three exist to protect the
 * portfolio's own performance — a recruiter's first impression is the page
 * speed, not the analytics:
 *
 *   1. **Dynamic import.** rrweb (~45 KB gzip) is never in the main bundle.
 *   2. **After idle.** Recording starts on `requestIdleCallback`, so it cannot
 *      compete with the hero animation for the first paint.
 *   3. **Only when configured and consented.** No env vars, or no consent, and
 *      this module does nothing and downloads nothing.
 *
 * `recordCanvas` stays off. This site runs three.js and canvas recording
 * snapshots pixels — it can inflate a session 10–100×. The WebGL hero replays
 * as a blank rectangle, which the dashboard labels rather than hides.
 */

import { isSelfVisit, readConsent } from './consent';
import { createTransport } from './transport';

const ENDPOINT = import.meta.env.VITE_ANALYTICS_URL;
const WRITE_KEY = import.meta.env.VITE_ANALYTICS_WRITE_KEY;

/**
 * Opt-in escape hatch for `npm run dev`.
 *
 * Recording is off in development by default — a recording of the developer
 * refreshing their own site all day outranks every real visitor in the triage
 * queue. But "off, always" also means the portfolio → ingest wiring can only
 * ever be tested in production, which is the wrong place to discover that the
 * endpoint path is wrong. Set VITE_ANALYTICS_DEV=1 to point a dev build at a
 * locally running backend; the `local` Spring profile already allows
 * http://localhost:5173 and http://localhost:4173 as origins.
 */
const RECORD_IN_DEV = import.meta.env.VITE_ANALYTICS_DEV === '1';

/** Engagement is only counted while the tab is visible and the visitor is active. */
const IDLE_AFTER_MS = 30000;

let started = false;
let handle = null;

/** Session ids are opaque and per-tab. Nothing in them identifies anyone. */
function newSessionId() {
  const random = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `s-${random.replace(/-/g, '').slice(0, 24)}`;
}

/**
 * @returns {boolean} whether recording could start at all — used by the banner
 *   to stay hidden on a deployment with no analytics configured.
 */
export const isConfigured = () => Boolean(ENDPOINT && WRITE_KEY);

export function stopRecording() {
  handle?.stop();
  handle = null;
  started = false;
}

/**
 * Idempotent: called on mount and again when consent is granted.
 * @returns {Promise<boolean>} whether recording is now running
 */
export async function startRecording() {
  if (started || !isConfigured()) return started;
  if (readConsent() !== 'granted') return false;
  // A recording of the developer refreshing their own site all day is noise
  // that outranks every real visitor in the triage queue — unless it was asked
  // for explicitly, to verify the wiring against a local backend.
  if (import.meta.env.DEV && !RECORD_IN_DEV) return false;

  started = true;

  const sessionId = newSessionId();
  const startedAt = Date.now();

  /* --- engagement state ---------------------------------------------------- */

  let engagedMs = 0;
  let engagedMsSent = 0;
  let interactions = 0;
  let interactionsSent = 0;
  let pagesSent = 0;
  let pageCount = 1;
  let maxScroll = 0;
  let lastActivityAt = Date.now();
  let lastTickAt = Date.now();

  const sections = [];
  /** Per-10-second event counts — the list view's activity sparkline. */
  const activity = [];

  const bump = () => {
    lastActivityAt = Date.now();
  };

  const tick = () => {
    const now = Date.now();
    const delta = now - lastTickAt;
    lastTickAt = now;

    // Wall clock counts a tab left open over lunch. Engaged time does not.
    if (document.visibilityState === 'visible' && now - lastActivityAt < IDLE_AFTER_MS) {
      engagedMs += delta;
    }
  };

  const engagementTimer = setInterval(tick, 1000);

  const stats = () => {
    tick();
    const engagedDelta = engagedMs - engagedMsSent;
    const interactionDelta = interactions - interactionsSent;
    const pageDelta = pageCount - pagesSent;
    engagedMsSent = engagedMs;
    interactionsSent = interactions;
    pagesSent = pageCount;

    return {
      durationMs: Date.now() - startedAt,
      // Cumulative values the server takes the maximum of…
      engagedMs,
      maxScroll,
      sections: [...sections],
      activity: [...activity],
      // …and deltas it sums, so a retried flush cannot double-count.
      engagedMsDelta: engagedDelta,
      interactionDelta,
      pageCountDelta: pageDelta,
    };
  };

  const transport = createTransport({
    endpoint: ENDPOINT,
    writeKey: WRITE_KEY,
    sessionId,
    startedAt,
    getStats: stats,
    self: isSelfVisit(),
  });

  /* --- rrweb --------------------------------------------------------------- */

  let stopRrweb = () => {};
  try {
    const { record } = await import('rrweb');

    stopRrweb =
      record({
        emit(event) {
          transport.push(event);

          const bucket = Math.floor((event.timestamp - startedAt) / 10000);
          if (bucket >= 0 && bucket < 2160) activity[bucket] = (activity[bucket] || 0) + 1;
        },
        // Nothing a visitor types is ever captured — not the contact form, not
        // a chat question. Only that the interaction happened.
        maskAllInputs: true,
        maskTextClass: 'vb-mask',
        blockClass: 'vb-no-record',
        // Off by design. See the module comment: three.js canvases would
        // dominate every payload.
        recordCanvas: false,
        collectFonts: false,
        sampling: {
          // 20 mouse positions a second is plenty to read intent, and a third
          // of the default's volume.
          mousemove: 50,
          scroll: 150,
          media: 800,
          // 'last' records that a field was interacted with, never each key.
          input: 'last',
        },
      }) || (() => {});
  } catch {
    // rrweb failed to load. Custom events and engagement stats still work, and
    // the visitor sees nothing.
    started = true;
  }

  /* --- listeners ------------------------------------------------------------ */

  const onScroll = () => {
    bump();
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const depth = Math.round(((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100);
    maxScroll = Math.min(100, Math.max(maxScroll, depth));
  };

  const onClick = (event) => {
    bump();
    interactions += 1;
    // Coordinates only. Used server-side for rage-click detection; no element
    // text and no form values ever leave the page.
    transport.click({ t: Date.now() - startedAt, x: event.clientX, y: event.clientY });
  };

  const onKey = () => {
    bump();
    interactions += 1;
  };

  const onVisibility = () => {
    bump();
    // Hidden usually means gone. Flush now, while there is still a page to
    // flush from.
    if (document.visibilityState === 'hidden') transport.flush(true);
  };

  const onPageHide = () => transport.flush(true);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('click', onClick, { passive: true });
  window.addEventListener('keydown', onKey, { passive: true });
  window.addEventListener('mousemove', bump, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);

  handle = {
    sessionId,
    startedAt,
    transport,
    /** Recorded by the section observer in events.js. */
    enterSection(name) {
      if (sections[sections.length - 1] === name) return;
      sections.push(name);
    },
    pageView() {
      pageCount += 1;
    },
    stop() {
      clearInterval(engagementTimer);
      stopRrweb();
      transport.flush(true);
      transport.dispose();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousemove', bump);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    },
  };

  onScroll();
  return true;
}

/** @returns {null | { sessionId: string, startedAt: number, transport: any, enterSection: Function, pageView: Function }} */
export const currentSession = () => handle;
