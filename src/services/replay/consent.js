/**
 * Consent gate for session recording.
 *
 * Session replay records real people. A public portfolio gets EU traffic, so
 * GDPR applies and nothing here is optional.
 *
 * The rules, in the order they are checked:
 *   1. Do Not Track / Global Privacy Control → never record, never ask. They
 *      have already answered; putting a banner in front of them is asking a
 *      question they took the trouble to pre-answer.
 *   2. A stored decision → honour it.
 *   3. Otherwise → the banner may ask, once.
 *
 * `No thanks` is a real button of equal weight in the UI. Dark patterns on a
 * personal portfolio are not worth the sessions.
 */

const STORAGE_KEY = 'vb:analytics-consent';
const SELF_KEY = 'vb:analytics-self';

/** @typedef {'granted' | 'denied' | 'unset'} ConsentState */

const listeners = new Set();

/** @returns {boolean} */
export function privacySignalSet() {
  if (typeof navigator === 'undefined') return true;
  return (
    navigator.doNotTrack === '1' ||
    window.doNotTrack === '1' ||
    navigator.msDoNotTrack === '1' ||
    navigator.globalPrivacyControl === true
  );
}

/** @returns {ConsentState} */
export function readConsent() {
  if (privacySignalSet()) return 'denied';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : 'unset';
  } catch {
    // Private mode or blocked storage — treat as no consent rather than as
    // permission. Failing closed is the only defensible default here.
    return 'denied';
  }
}

/** @param {'granted' | 'denied'} value */
export function setConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Nothing to do; the decision holds for this page load only.
  }
  for (const listener of listeners) listener(value);
}

/** @param {(state: ConsentState) => void} listener */
export function onConsentChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Should the banner be shown at all? */
export const shouldAskConsent = () => readConsent() === 'unset';

/**
 * Am I the one browsing?
 *
 * Set once by visiting the site with `?vb_self=1`. Without it the operator's
 * own visits are the highest-scoring sessions in the dashboard, every day,
 * and the triage queue becomes a mirror.
 */
export function isSelfVisit() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('vb_self') === '1') localStorage.setItem(SELF_KEY, '1');
    if (params.get('vb_self') === '0') localStorage.removeItem(SELF_KEY);
    return localStorage.getItem(SELF_KEY) === '1';
  } catch {
    return false;
  }
}
