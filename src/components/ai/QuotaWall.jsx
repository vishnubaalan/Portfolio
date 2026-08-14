import { FileText, FolderKanban, Mail, Sparkles } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setChatOpen } from '../../store/slices/chatSlice';
import { setResumePreviewOpen } from '../../store/slices/uiSlice';
import { scrollToSection } from '../../hooks/useLenis';
import { GMAIL_COMPOSE_URL } from '../../data/links';
import { CHIP_QUESTIONS } from '../../data/ai/faq';
import { SuggestionChips } from './SuggestionChips';

/**
 * Replaces the composer once the 10 questions are gone.
 *
 * This is where an interested visitor lands, so it converts rather than shuts
 * down: warm copy, the three real actions, and chips that still answer from the
 * local FAQ at zero API cost.
 */
export function QuotaWall({ resetsAt, onPick }) {
  const dispatch = useAppDispatch();

  const resetLabel = resetsAt
    ? new Date(resetsAt).toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      })
    : 'midnight';

  const jump = (id) => {
    dispatch(setChatOpen(false));
    setTimeout(() => scrollToSection(id), 120);
  };

  return (
    <div className="border-t border-border bg-surface/80 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
      <div className="rounded-2xl border border-border bg-bg/50 p-4">
        <p className="flex items-center gap-2 text-[13px] font-medium text-text">
          <Sparkles className="h-4 w-4 text-accent" />
          That&apos;s your 10 for today
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
          Resets at {resetLabel} IST. If you want the real conversation, that&apos;s better
          over email anyway — I answer personally.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={GMAIL_COMPOSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-medium text-text-inverse shadow-glow-primary transition-colors hover:bg-primary-hover"
          >
            <Mail className="h-3.5 w-3.5" />
            Email Vishnu
          </a>
          <button
            type="button"
            onClick={() => {
              dispatch(setChatOpen(false));
              dispatch(setResumePreviewOpen(true));
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs text-text-muted transition-colors hover:border-primary hover:text-text"
          >
            <FileText className="h-3.5 w-3.5" />
            Resume
          </button>
          <button
            type="button"
            onClick={() => jump('projects')}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs text-text-muted transition-colors hover:border-primary hover:text-text"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            Projects
          </button>
        </div>

        <p className="mt-4 text-[11px] uppercase tracking-wider text-text-subtle">
          Still answerable offline
        </p>
        <SuggestionChips
          questions={CHIP_QUESTIONS}
          onPick={onPick}
          size="sm"
          className="mt-2"
        />
      </div>
    </div>
  );
}
