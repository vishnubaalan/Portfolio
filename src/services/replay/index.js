/**
 * Public surface of the replay SDK.
 *
 * The entire feature is behind two environment variables. Without
 * VITE_ANALYTICS_URL and VITE_ANALYTICS_WRITE_KEY nothing here runs, nothing is
 * downloaded, and the consent banner never renders — so a fork of this
 * portfolio, or a preview deploy, is silent by default rather than by accident.
 *
 * See docs/session-replay-plan.v2.md for the design this implements.
 */

export { EVENTS, track, trackPageView, observeSections } from './events';
export { isConfigured, startRecording, stopRecording, currentSession } from './recorder';
export {
  onConsentChange,
  privacySignalSet,
  readConsent,
  setConsent,
  shouldAskConsent,
  isSelfVisit,
} from './consent';
