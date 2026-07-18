import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const QUOTE =
  'I believe great software is created by combining clean engineering, thoughtful design, and continuous learning.';

export function Philosophy() {
  return (
    <section id="philosophy" className="relative flex min-h-[70vh] items-center py-24 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, oklch(0.78 0.16 220 / 0.12), transparent 60%)',
        }}
      />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <Quote className="mx-auto mb-6 h-10 w-10 text-primary/60" />
          <p className="text-3xl font-medium leading-tight tracking-tight text-text sm:text-4xl md:text-5xl">
            {QUOTE.split(' ').map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.03 * i, ease: [0.25, 1, 0.5, 1] }}
                className="inline-block"
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </p>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-text-subtle">
            — Vishnu Baalan
          </p>
        </motion.div>
      </div>
    </section>
  );
}
