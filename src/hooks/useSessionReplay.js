import { useEffect } from 'react';
import { SECTIONS } from '../constants';
import { isConfigured, observeSections, onConsentChange, startRecording, trackPageView } from '../services/replay';

/**
 * Starts session recording, once, after the page has settled.
 *
 * `requestIdleCallback` rather than a mount effect: the hero runs three.js and
 * a typing animation, and the first two seconds of this page are the entire
 * reason it exists. Analytics waits its turn — and if the browser never goes
 * idle, the timeout fallback fires anyway.
 *
 * Also re-starts when consent is granted from the banner, so allowing it
 * records the rest of the visit rather than only the next one.
 */
export function useSessionReplay() {
  useEffect(() => {
    if (!isConfigured()) return undefined;

    let cancelled = false;
    let stopObserving = () => {};

    const begin = async () => {
      if (cancelled) return;
      const running = await startRecording();
      if (!running || cancelled) return;

      trackPageView();
      stopObserving = observeSections(SECTIONS.map((section) => section.id));
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(begin, { timeout: 4000 })
      : setTimeout(begin, 2000);

    // Granting consent starts recording mid-visit; the section observer has to
    // be attached at that point too, or the journey trail is empty for exactly
    // the visitors who agreed to be recorded.
    const unsubscribe = onConsentChange((state) => {
      if (state === 'granted') begin();
    });

    return () => {
      cancelled = true;
      unsubscribe();
      stopObserving();
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, []);
}
