import { useEffect, useRef } from 'react';
import { WifiOff } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { SuggestionChips } from './SuggestionChips';
import { CHIP_QUESTIONS } from '../../data/ai/faq';
import { cn } from '../../utils/cn';

/**
 * Scroll container for the thread. Sticks to the bottom while an answer streams,
 * but stops fighting the visitor the moment they scroll up to re-read something.
 */
export function ChatMessageList({ messages, status, error, degraded, onPick, onRetry }) {
  const scrollRef = useRef(null);
  const stickRef = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !stickRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  };

  const isEmpty = messages.length === 0;
  const lastAnswer = [...messages].reverse().find((m) => m.role === 'assistant' && !m.streaming);

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      data-lenis-prevent
      className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
    >
      {/* Screen readers get the finished answer, not every streamed token. */}
      <div aria-live="polite" className="sr-only">
        {status === 'idle' && lastAnswer ? lastAnswer.content : ''}
      </div>

      {isEmpty && (
        <div className="space-y-4 py-2">
          <p className="text-[13px] leading-relaxed text-text-muted">
            Hey — I&apos;m Vishnu&apos;s AI. Ask me about his stack, the projects he&apos;s
            shipped, where he works, or whether he&apos;s free for a build. I answer from
            his real work, and I&apos;ll point you to him when it matters.
          </p>
          <SuggestionChips questions={CHIP_QUESTIONS} onPick={onPick} size="sm" />
        </div>
      )}

      {messages.map((message, i) => (
        <ChatMessage
          key={message.id}
          message={message}
          onRetry={message.error && i === messages.length - 1 ? onRetry : undefined}
        />
      ))}

      {status === 'streaming' && messages[messages.length - 1]?.content === '' && (
        <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-surface/70 px-3.5 py-3 w-fit">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-subtle"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-start gap-2">
          <div className="rounded-2xl border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-[13px] text-text">
            {error.message}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-primary hover:text-text"
            >
              Retry
            </button>
            <a
              href="mailto:vishnubaalan.b@gmail.com"
              className="rounded-full border border-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-primary hover:text-text"
            >
              or just email me
            </a>
          </div>
        </div>
      )}

      {degraded && !isEmpty && (
        <p className={cn('flex items-center gap-1.5 text-[11px] text-text-subtle')}>
          <WifiOff className="h-3 w-3" />
          Offline mode — answering from saved notes.
        </p>
      )}
    </div>
  );
}
