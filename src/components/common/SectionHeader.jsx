import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function SectionHeader({ eyebrow, title, description, align = 'left', className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      className={cn(
        'mb-12 space-y-3',
        align === 'center' && 'text-center mx-auto max-w-2xl',
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center rounded-full border border-border bg-surface/50 px-3 py-1 text-xs font-mono uppercase tracking-wider text-text-muted">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl md:text-5xl text-gradient">
        {title}
      </h2>
      {description && (
        <p className="text-base text-text-muted sm:text-lg max-w-2xl">
          {description}
        </p>
      )}
    </motion.div>
  );
}
