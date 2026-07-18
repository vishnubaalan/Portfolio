import { useEffect } from 'react';
import { useAppDispatch } from './redux';
import { setActiveSection } from '../store/slices/uiSlice';
import { SECTIONS } from '../constants';

export function useActiveSection() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top?.target?.id) dispatch(setActiveSection(top.target.id));
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [dispatch]);
}
