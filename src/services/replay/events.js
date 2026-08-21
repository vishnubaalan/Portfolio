/**
 * Custom events — the semantic layer over the replay stream.
 *
 * The replay shows *what happened*; these say *what it meant*. They are what
 * the Interest Score is built from and what the player's timeline is marked
 * with, so the vocabulary is closed and deliberately small. An event named
 * `button_click_2` is worth nothing to either.
 *
 * Everything here is a no-op when recording is not running, so call sites never
 * need to guard.
 */

import { currentSession } from './recorder';

/** The closed vocabulary. Adding one means deciding what it is worth. */
export const EVENTS = {
  PAGE_VIEW: 'page_view',
  SECTION_VIEW: 'section_view',
  CTA_CLICK: 'cta_click',
  PROJECT_OPEN: 'project_open',
  RESUME_DOWNLOAD: 'resume_download',
  RESUME_PREVIEW: 'resume_preview',
  CHAT_OPEN: 'chat_open',
  CHAT_QUESTION: 'chat_question',
  CONTACT_SUBMIT: 'contact_submit',
  SOCIAL_CLICK: 'social_click',
  COMMAND_PALETTE: 'command_palette',
};

/**
 * @param {string} name one of EVENTS
 * @param {Record<string, string|number|boolean>} [props] small, non-personal
 */
export function track(name, props = {}) {
  const session = currentSession();
  if (!session) return;

  session.transport.track({
    name,
    path: window.location.pathname,
    tMs: Date.now() - session.startedAt,
    // Guarded rather than trusted: a props object that grows to hold a form
    // value is exactly how a "no personal data" promise quietly stops being
    // true. Primitives only, and capped.
    props: Object.fromEntries(
      Object.entries(props)
        .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
        .slice(0, 8)
        .map(([key, value]) => [key.slice(0, 32), typeof value === 'string' ? value.slice(0, 120) : value]),
    ),
  });
}

export function trackPageView() {
  const session = currentSession();
  if (!session) return;
  session.pageView();
  track(EVENTS.PAGE_VIEW);
}

/**
 * Records the order sections are reached — the journey trail in the dashboard,
 * and the highest-information element in a session row.
 *
 * @param {string[]} sectionIds
 * @returns {() => void} cleanup
 */
export function observeSections(sectionIds) {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  const seen = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // Half the section on screen, not a single pixel — scrolling *past*
        // something is not reaching it.
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;

        const id = entry.target.id;
        currentSession()?.enterSection(id);

        if (seen.has(id)) continue;
        seen.add(id);
        track(EVENTS.SECTION_VIEW, { section: id });
      }
    },
    { threshold: [0.5] },
  );

  for (const id of sectionIds) {
    const element = document.getElementById(id);
    if (element) observer.observe(element);
  }

  return () => observer.disconnect();
}
