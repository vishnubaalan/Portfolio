import { motion } from 'framer-motion';
import { SectionHeader } from '../../components/common/SectionHeader';
import { TIMELINE } from '../../data/timeline';
import { cn } from '../../utils/cn';

const STATUS_STYLES = {
  past: 'border-border bg-surface',
  current: 'border-primary/50 bg-primary/10 shadow-glow-primary',
  future: 'border-accent/40 bg-accent/5',
};

export function About() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeader
          eyebrow="About Me"
          title="My story so far"
          description="I enjoy building modern web applications that are fast, scalable, and user-friendly. My interests extend beyond frontend into AI engineering, automation, and intelligent agent systems. I'm currently expanding into backend, networking, and system architecture."
        />

        <div className="relative mx-auto max-w-3xl">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-border to-transparent md:left-1/2 md:-ml-px" />

          <ol className="space-y-8">
            {TIMELINE.map((item, i) => {
              const alignRight = i % 2 === 1;
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: 0.05 * i, ease: [0.25, 1, 0.5, 1] }}
                  className={cn(
                    'relative flex items-start gap-4 md:gap-0',
                    'md:grid md:grid-cols-2',
                  )}
                >
                  <div
                    className={cn(
                      'absolute left-4 top-3 h-3 w-3 -translate-x-1/2 rounded-full border-2 md:left-1/2',
                      item.status === 'current'
                        ? 'border-primary bg-primary shadow-glow-primary'
                        : item.status === 'future'
                          ? 'border-accent bg-bg'
                          : 'border-border-strong bg-bg',
                    )}
                  />
                  <div
                    className={cn(
                      'ml-10 flex-1 md:ml-0',
                      alignRight ? 'md:col-start-2 md:pl-8' : 'md:col-start-1 md:pr-8 md:text-right',
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-xl border p-4 shadow-card',
                        STATUS_STYLES[item.status],
                      )}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-wider text-text-subtle">
                        {item.year}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-text">{item.title}</h3>
                      <p className="mt-1 text-sm text-text-muted">{item.description}</p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
