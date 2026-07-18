import { useEffect } from 'react';
import Lenis from 'lenis';
import { useAppDispatch } from './redux';
import { setScrollProgress } from '../store/slices/uiSlice';
import { useReducedMotion } from './useReducedMotion';

export function useLenis() {
  const dispatch = useAppDispatch();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ({ scroll, limit }) => {
      const progress = limit > 0 ? Math.min(1, scroll / limit) : 0;
      dispatch(setScrollProgress(progress));
    });

    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.__lenis = lenis;
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [dispatch, reduced]);
}

/** Scroll to a section via Lenis when available, native fallback otherwise. */
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: -72 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
