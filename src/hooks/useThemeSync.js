import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { setResolved } from '../store/slices/themeSlice';

/**
 * Syncs the Redux theme state to the DOM (data-theme, color-scheme, localStorage,
 * meta[theme-color]) and listens for OS-level theme changes when mode === 'system'.
 */
export function useThemeSync() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const resolved = useAppSelector((s) => s.theme.resolved);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme-transitioning', 'true');
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;

    const metaDark = document.querySelector('meta[name="theme-color"][media*="dark"]');
    const metaLight = document.querySelector('meta[name="theme-color"][media*="light"]');
    if (metaDark) metaDark.setAttribute('content', resolved === 'dark' ? '#0A0D1C' : '#F8F9FC');
    if (metaLight) metaLight.setAttribute('content', resolved === 'light' ? '#F8F9FC' : '#0A0D1C');

    const t = setTimeout(() => root.removeAttribute('data-theme-transitioning'), 250);
    return () => clearTimeout(t);
  }, [resolved]);

  useEffect(() => {
    if (mode === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', mode);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return undefined;
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e) => dispatch(setResolved(e.matches ? 'light' : 'dark'));
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mode, dispatch]);
}
