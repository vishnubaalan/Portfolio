import { motion } from 'framer-motion';
import {
  AlertCircle,
  Briefcase,
  FileText,
  FolderKanban,
  Mail,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setChatOpen } from '../../store/slices/chatSlice';
import { setResumePreviewOpen } from '../../store/slices/uiSlice';
import { scrollToSection } from '../../hooks/useLenis';
import { GMAIL_COMPOSE_URL } from '../../data/links';
import { deriveActions } from '../../utils/chatActions';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../utils/cn';

const ACTIONS = {
  email: { label: 'Email me', icon: Mail },
  resume: { label: 'Resume', icon: FileText },
  projects: { label: 'See projects', icon: FolderKanban, section: 'projects' },
  work: { label: 'Work history', icon: Briefcase, section: 'work' },
  skills: { label: 'My stack', icon: Sparkles, section: 'skills' },
};

export function ChatMessage({ message, onRetry }) {
  const dispatch = useAppDispatch();
  const reduced = useReducedMotion();
  const isUser = message.role === 'user';

  const runAction = (id) => {
    if (id === 'email') {
      window.open(GMAIL_COMPOSE_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    if (id === 'resume') {
      dispatch(setChatOpen(false));
      dispatch(setResumePreviewOpen(true));
      return;
    }
    // Section jumps close the panel — the site does the rest of the selling.
    dispatch(setChatOpen(false));
    setTimeout(() => scrollToSection(ACTIONS[id].section), 120);
  };

  if (message.error) {
    return (
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-start gap-2 rounded-2xl border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-[13px] text-text">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <span>{message.content || 'That answer did not come through.'}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-primary hover:text-text"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  // While the answer is still empty the list shows a typing indicator instead —
  // rendering an empty bubble here would double it up.
  if (message.streaming && !message.content) return null;

  const actions = !isUser && !message.streaming ? deriveActions(message.content) : [];

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start')}
    >
      <div
        className={cn(
          'max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
          isUser
            ? 'rounded-br-md border border-primary/30 bg-primary/12 text-text'
            : 'rounded-bl-md border border-border bg-surface/70 text-text',
        )}
      >
        {message.content}
        {message.streaming && (
          <span
            className={cn(
              'ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-primary',
              !reduced && 'animate-pulse',
            )}
          />
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {actions.map((id) => {
            const action = ACTIONS[id];
            if (!action) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => runAction(id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/20"
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
