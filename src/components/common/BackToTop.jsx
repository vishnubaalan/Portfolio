import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { scrollToSection } from '../../hooks/useLenis';

export function BackToTop() {
  const progress = useAppSelector((s) => s.ui.scrollProgress);
  const visible = progress > 0.1;

  return (
    <AnimatePresence>
      {/* Stacked above the chat launcher, which owns bottom-6 right-6. */}
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          onClick={() => scrollToSection('hero')}
          aria-label="Back to top"
          className="fixed bottom-[5.5rem] right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full glass text-text hover:text-primary transition-colors shadow-elevated"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
