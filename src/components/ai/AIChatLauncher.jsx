import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { markHintShown, setChatOpen } from '../../store/slices/chatSlice';
import { EVENTS, track } from '../../services/replay';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { saveFlags } from '../../utils/chatStorage';

/** Far enough past the hero that it never competes with the first impression. */
const APPEAR_AT = 0.06;
const HINT_DELAY_MS = 6000;
const HINT_DURATION_MS = 5000;

/**
 * One component, two entry points.
 *
 * `pill`  — in the NavBar, always reachable on desktop.
 * `fab`   — bottom-right, after the hero scrolls past. Sits above BackToTop in
 *           a shared stack (BackToTop is offset to bottom-[5.5rem]) so the two
 *           can never overlap.
 */
export function AIChatLauncher({ variant = 'fab', className }) {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.chat.open);
  const progress = useAppSelector((s) => s.ui.scrollProgress);
  const flags = useAppSelector((s) => s.chat.flags);

  const isMobile = useMediaQuery('(max-width: 639px)');
  const reduced = useReducedMotion();
  const [hint, setHint] = useState(false);

  const visible = progress > APPEAR_AT && !open;

  /* Nudge once per visitor, on desktop, never under reduced motion. */
  useEffect(() => {
    if (variant !== 'fab' || !visible || flags.hintShown || isMobile || reduced) return undefined;

    const show = setTimeout(() => setHint(true), HINT_DELAY_MS);
    const hide = setTimeout(() => {
      setHint(false);
      dispatch(markHintShown());
      saveFlags({ ...flags, hintShown: true });
    }, HINT_DELAY_MS + HINT_DURATION_MS);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [variant, visible, flags, isMobile, reduced, dispatch]);

  const openChat = () => {
    track(EVENTS.CHAT_OPEN);
    dispatch(setChatOpen(true));
  };

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={openChat}
        className={
          className ||
          'hidden items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs text-primary transition-colors hover:bg-primary/20 md:flex'
        }
      >
        <Sparkles className="h-3 w-3" />
        Ask AI
      </button>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-[45] flex items-center gap-2"
        >
          <AnimatePresence>
            {hint && (
              <motion.button
                type="button"
                onClick={openChat}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="hidden rounded-full glass px-3.5 py-2 text-xs text-text shadow-card sm:block"
              >
                Ask me anything about Vishnu
              </motion.button>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={openChat}
            aria-label="Ask Vishnu's AI"
            className="group flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-text-inverse shadow-glow-primary transition-colors hover:bg-primary-hover"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden text-sm font-medium sm:inline">Ask AI</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
