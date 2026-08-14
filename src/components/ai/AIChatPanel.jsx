import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  consumePendingPrompt,
  dismissDisclosure,
  setChatOpen,
} from '../../store/slices/chatSlice';
import { useAIChat } from '../../hooks/useAIChat';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { saveFlags } from '../../utils/chatStorage';
import { ChatMessageList } from './ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { QuotaWall } from './QuotaWall';

export function AIChatPanel() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.chat.open);
  const flags = useAppSelector((s) => s.chat.flags);
  const pendingPrompt = useAppSelector((s) => s.chat.pendingPrompt);

  const { messages, status, error, quota, degraded, send, stop, retry, reset } = useAIChat();

  const isMobile = useMediaQuery('(max-width: 639px)');
  const reduced = useReducedMotion();
  const dragControls = useDragControls();

  /* A chip or CTA can open the panel with the question already queued. */
  useEffect(() => {
    if (!open || !pendingPrompt) return;
    send(pendingPrompt);
    dispatch(consumePendingPrompt());
  }, [open, pendingPrompt, send, dispatch]);

  const close = () => dispatch(setChatOpen(false));

  const hideDisclosure = () => {
    dispatch(dismissDisclosure());
    saveFlags({ ...flags, disclosureDismissed: true });
  };

  const exhausted = quota.remaining === 0;
  const enter = reduced
    ? { opacity: 1 }
    : isMobile
      ? { opacity: 1, y: 0 }
      : { opacity: 1, x: 0 };
  const from = reduced ? { opacity: 0 } : isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, x: 32 };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => dispatch(setChatOpen(v))}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[180]"
                style={{ background: 'var(--scrim)' }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={from}
                animate={enter}
                exit={from}
                transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
                drag={isMobile ? 'y' : false}
                dragListener={false}
                dragControls={dragControls}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 120 || info.velocity.y > 600) close();
                }}
                data-lenis-prevent
                className="fixed z-[181] flex flex-col overflow-hidden glass shadow-elevated
                  inset-x-0 bottom-0 h-[88vh] rounded-t-2xl
                  sm:inset-y-4 sm:left-auto sm:right-4 sm:h-auto sm:w-[92vw] sm:max-w-[26rem] sm:rounded-2xl
                  lg:w-[420px] lg:max-w-[420px]"
              >
                <VisuallyHidden asChild>
                  <Dialog.Title>Ask Vishnu&apos;s AI</Dialog.Title>
                </VisuallyHidden>
                <VisuallyHidden asChild>
                  <Dialog.Description>
                    An AI assistant that answers questions about Vishnu Baalan&apos;s work,
                    stack and availability. Ten questions per day.
                  </Dialog.Description>
                </VisuallyHidden>

                {/* Drag handle — the only drag surface, so the thread still scrolls. */}
                {isMobile && (
                  <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="flex cursor-grab justify-center py-2 active:cursor-grabbing"
                  >
                    <span className="h-1 w-10 rounded-full bg-border-strong" />
                  </div>
                )}

                <header className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <span className="relative">
                    <img
                      src="/profile-pic.png"
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-success" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text">Vishnu&apos;s AI</p>
                    <p className="text-[11px] text-text-subtle">
                      {degraded ? 'offline mode' : 'trained on his real work'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    aria-label="Clear conversation"
                    title="Clear conversation"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border text-text-muted transition-colors hover:border-primary hover:text-text"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close chat"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border text-text-muted transition-colors hover:border-primary hover:text-text"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                {!flags.disclosureDismissed && (
                  <div className="flex items-start gap-2 border-b border-border bg-surface-2/50 px-4 py-2 text-[11px] leading-relaxed text-text-subtle">
                    <span className="flex-1">
                      AI trained on Vishnu&apos;s real work. It can be imperfect — email him
                      to confirm anything important.
                    </span>
                    <button
                      type="button"
                      onClick={hideDisclosure}
                      aria-label="Dismiss notice"
                      className="shrink-0 text-text-subtle transition-colors hover:text-text"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <ChatMessageList
                  messages={messages}
                  status={status}
                  error={error}
                  degraded={degraded}
                  onPick={send}
                  onRetry={retry}
                />

                {exhausted ? (
                  <QuotaWall resetsAt={quota.resetsAt} onPick={send} />
                ) : (
                  <ChatComposer
                    onSend={send}
                    onStop={stop}
                    streaming={status === 'streaming'}
                    remaining={quota.remaining}
                    showQuota={messages.length > 0}
                    autoFocus={!isMobile}
                  />
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
