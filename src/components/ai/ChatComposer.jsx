import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Mail, Square } from 'lucide-react';
import { GMAIL_COMPOSE_URL } from '../../data/links';
import { MAX_INPUT_CHARS } from '../../hooks/useAIChat';
import { cn } from '../../utils/cn';

/**
 * Quota copy is deliberately quiet until it matters: nothing before the first
 * question, neutral in the middle, and a nudge toward email at the end. A
 * counter on an empty chat reads as stingy.
 */
function quotaLine(remaining) {
  if (remaining === null || remaining === undefined) return null;
  if (remaining >= 6) return { text: `${remaining} free questions today`, tone: 'muted' };
  if (remaining >= 3) return { text: `${remaining} questions left today`, tone: 'muted' };
  if (remaining >= 1) return { text: `${remaining} left today`, tone: 'warning' };
  return null;
}

export function ChatComposer({ onSend, onStop, streaming, remaining, showQuota, autoFocus }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Desktop only — focusing on a phone throws up the keyboard over the answer.
  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  // Auto-grow to a few lines, then scroll internally.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || streaming) return;
    setValue('');
    onSend(text);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const quota = showQuota ? quotaLine(remaining) : null;
  const nearLimit = value.length > MAX_INPUT_CHARS - 80;

  return (
    <div className="border-t border-border bg-surface/80 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-bg/60 px-3 py-2 focus-within:border-primary/60">
        {/* vb-mask: questions typed here are never captured by session replay.
            The endpoint sees them; the recording must not. */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={MAX_INPUT_CHARS}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about my stack, projects, work…"
          aria-label="Ask Vishnu's AI a question"
          className="vb-mask flex-1 resize-none bg-transparent py-1 text-[13px] text-text placeholder:text-text-subtle focus:outline-none"
        />

        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-text-muted transition-colors hover:border-primary hover:text-text"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim()}
            aria-label="Send question"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-text-inverse transition-opacity hover:bg-primary-hover disabled:opacity-35"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 px-1">
        {quota ? (
          <span
            className={cn(
              'text-[11px]',
              quota.tone === 'warning' ? 'text-warning' : 'text-text-subtle',
            )}
          >
            {quota.text}
          </span>
        ) : (
          <span />
        )}

        {nearLimit && (
          <span className="text-[11px] text-text-subtle">
            {value.length}/{MAX_INPUT_CHARS}
          </span>
        )}

        {quota?.tone === 'warning' && (
          <a
            href={GMAIL_COMPOSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            <Mail className="h-3 w-3" />
            Want to go deeper? Email me
          </a>
        )}
      </div>
    </div>
  );
}
