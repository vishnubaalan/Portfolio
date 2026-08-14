import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { askAI } from '../../store/slices/chatSlice';
import { CHIP_QUESTIONS } from '../../data/ai/faq';
import { SuggestionChips } from './SuggestionChips';

/**
 * Lives inside the AI Assistant section — the strongest contextual moment on
 * the page. The visitor has just read that Vishnu builds AI assistants, so let
 * them talk to a small one. Picking a chip opens the panel with that question
 * already sent.
 */
export function AIChatTeaser() {
  const dispatch = useAppDispatch();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className="mt-8 rounded-2xl border border-border bg-surface/50 p-4"
    >
      <button
        type="button"
        onClick={() => dispatch(askAI())}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-bg/50 px-4 py-3 text-left transition-colors hover:border-primary/60"
      >
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <span className="flex-1 text-sm text-text-subtle">Ask anything about me…</span>
        <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" />
      </button>

      <p className="mt-3 text-[11px] uppercase tracking-wider text-text-subtle">
        Try one
      </p>
      <SuggestionChips
        questions={CHIP_QUESTIONS}
        onPick={(q) => dispatch(askAI(q))}
        size="sm"
        className="mt-2"
      />
    </motion.div>
  );
}
