import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Mail } from 'lucide-react';
import { MagneticButton } from '../../components/common/MagneticButton';
import { useTypingCycle } from '../../hooks/useTypingCycle';
import { TYPING_WORDS } from '../../constants';
import { scrollToSection } from '../../hooks/useLenis';
import { useAppDispatch } from '../../hooks/redux';
import { setResumePreviewOpen } from '../../store/slices/uiSlice';
import { HeroBackground } from './HeroBackground';

const AICore = lazy(() =>
  import('./AICore').then((m) => ({ default: m.AICore })),
);

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
  },
};

export function Hero() {
  const typed = useTypingCycle(TYPING_WORDS);
  const dispatch = useAppDispatch();

  return (
    <section id="hero" className="relative flex min-h-[100svh] items-center overflow-hidden pt-24">
      <HeroBackground />

      <div className="section-container relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Available for opportunities
          </motion.div>

          <motion.h1 variants={item} className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            <span className="block text-text-muted text-2xl sm:text-3xl mb-3">Hi <span className="inline-block">👋</span> I'm</span>
            <span className="text-gradient">Vishnu Baalan</span>
          </motion.h1>

          <motion.p variants={item} className="text-xl sm:text-2xl text-text-muted font-medium">
            I'm a{' '}
            <span className="text-text-inverse inline-block min-w-[10ch] rounded-md bg-primary px-2 py-0.5">
              {typed}
              <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-text-inverse align-middle" style={{ height: '1em' }} />
            </span>
          </motion.p>

          <motion.p variants={item} className="max-w-xl text-base text-text-muted leading-relaxed">
            Software Engineer · Fullstack Developer · AI Enthusiast.
            Building intelligent systems and fast, elegant interfaces end-to-end.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3 pt-2">
            <MagneticButton
              onClick={() => scrollToSection('projects')}
              className="bg-primary text-text-inverse hover:bg-primary-hover shadow-glow-primary"
            >
              View Projects
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton
              onClick={() => dispatch(setResumePreviewOpen(true))}
              className="glass text-text hover:border-primary"
            >
              <FileText className="h-4 w-4" />
              Resume
            </MagneticButton>
            <MagneticButton
              onClick={() => scrollToSection('contact')}
              className="text-text-muted hover:text-text"
            >
              <Mail className="h-4 w-4" />
              Contact
            </MagneticButton>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="relative aspect-square w-full max-w-md mx-auto lg:mx-0 lg:max-w-none"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl" />
          <div className="relative h-full w-full">
            <Suspense fallback={<div className="h-full w-full rounded-full bg-gradient-to-tr from-primary/30 to-accent/30 blur-2xl animate-pulse" />}>
              <AICore />
            </Suspense>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
