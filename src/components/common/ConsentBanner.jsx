import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { isConfigured, setConsent, shouldAskConsent, startRecording } from '../../services/replay';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Consent for session recording.
 *
 * Deliberately not a modal and not a wall (see docs/session-replay-plan.v2.md
 * §5). It is one line, bottom-left, after a delay — never over the hero on
 * arrival, because the first three seconds of this page are the entire point of
 * the page.
 *
 * `No thanks` carries the same visual weight as `Allow`. Nudging someone into
 * being recorded is not worth the sessions, and a portfolio that pulls that
 * trick is making a statement about how its author builds things.
 *
 * Renders nothing at all when analytics is unconfigured, when consent has
 * already been decided, or when DNT/GPC is set — that last one is an answer,
 * not an invitation to ask again.
 */
const ASK_DELAY_MS = 2500;

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isConfigured() || !shouldAskConsent()) return undefined;
    const timer = setTimeout(() => setVisible(true), ASK_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const decide = (value) => {
    setConsent(value);
    setVisible(false);
    if (value === 'granted') startRecording();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="dialog"
          aria-label="Session recording consent"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className="glass fixed bottom-4 left-4 z-40 w-[min(24rem,calc(100vw-2rem))] rounded-lg p-4 shadow-elevated"
        >
          <button
            onClick={() => decide('denied')}
            className="absolute right-2 top-2 rounded p-1 text-text-subtle transition-colors hover:text-text"
            aria-label="Dismiss — do not record"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>

          <p className="pr-6 text-sm leading-relaxed text-text">
            I record anonymised sessions to see what’s working on this site.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            No typed content, no personal data, no third-party trackers.{' '}
            <button
              onClick={() => setExpanded((value) => !value)}
              className="text-primary underline-offset-2 hover:underline"
              aria-expanded={expanded}
            >
              What’s recorded?
            </button>
          </p>

          {expanded && (
            <ul className="mt-2 space-y-1 border-l border-border pl-3 text-xs leading-relaxed text-text-muted">
              <li>Pages, scrolling, clicks and how long you stayed.</li>
              <li>Browser, device and country — never your IP address.</li>
              <li>
                <strong className="font-medium text-text">Never</strong> what you type: the contact form and
                the AI chat are masked before anything is sent.
              </li>
              <li>Deleted automatically after 90 days.</li>
            </ul>
          )}

          {/* Equal weight, on purpose. */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => decide('granted')}
              className="flex-1 rounded bg-primary px-3 py-2 text-xs font-medium text-text-inverse transition-colors hover:bg-primary-hover"
            >
              Allow
            </button>
            <button
              onClick={() => decide('denied')}
              className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs font-medium text-text transition-colors hover:border-border-strong hover:bg-surface-2"
            >
              No thanks
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
