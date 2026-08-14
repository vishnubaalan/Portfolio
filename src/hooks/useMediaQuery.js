import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribe to a media query. Used by the chat panel, which is a bottom sheet
 * on phones and a docked panel on desktop — behaviours that differ beyond what
 * CSS alone can express (drag-to-dismiss, autofocus).
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
