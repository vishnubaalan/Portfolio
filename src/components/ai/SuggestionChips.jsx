import { cn } from '../../utils/cn';

/**
 * Tappable starter questions. Shared by the empty state, the in-page teaser and
 * the quota wall so the phrasing a visitor sees is identical everywhere.
 */
export function SuggestionChips({ questions, onPick, className, size = 'md' }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onPick(q)}
          className={cn(
            'rounded-full border border-border bg-surface/60 text-text-muted transition-colors',
            'hover:border-primary hover:text-text',
            size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-[13px]',
          )}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
