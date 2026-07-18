import { motion } from 'framer-motion';
import { Building2, Calendar, Briefcase } from 'lucide-react';
import { SectionHeader } from '../../components/common/SectionHeader';
import { WORK } from '../../data/work';
import { cn } from '../../utils/cn';

export function Work() {
  return (
    <section id="work" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeader
          eyebrow="Work Experience"
          title="Where I've engineered"
          description="Internships and full-time roles — the places I've learned how to ship in production."
        />

        <div className="mb-10 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">
            <Briefcase className="h-3 w-3" />
            Currently engineering @ Breezeware
          </span>
        </div>

        <ol className="relative mx-auto max-w-3xl">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-border to-transparent md:left-6" />

          {WORK.map((role, i) => (
            <motion.li
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.06 * i, ease: [0.25, 1, 0.5, 1] }}
              className="relative pl-14 pb-10 last:pb-0 md:pl-20"
            >
              <div
                className={cn(
                  'absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-xl border shadow-card md:left-2 md:h-10 md:w-10',
                  role.current
                    ? 'border-primary/60 bg-primary/15 text-primary shadow-glow-primary'
                    : 'border-border bg-surface text-text-muted',
                )}
                aria-hidden="true"
              >
                <span className="font-mono text-sm font-semibold">
                  {role.company.charAt(0)}
                </span>
              </div>

              <div
                className={cn(
                  'rounded-2xl border p-5 shadow-card transition-colors',
                  role.current
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-surface hover:border-border-strong',
                )}
              >
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-text">{role.role}</h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-text-muted">
                      <Building2 className="h-3.5 w-3.5" />
                      {role.company}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg/40 px-2.5 py-0.5 text-[11px] text-text-muted">
                      <Calendar className="h-3 w-3" />
                      {role.dates}
                    </span>
                    {role.current ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        Present
                      </span>
                    ) : (
                      <span className="rounded-full border border-border bg-bg/40 px-2.5 py-0.5 text-[11px] text-text-subtle">
                        {role.duration}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-text-muted">{role.summary}</p>

                {role.tech.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {role.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border bg-bg/40 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-text-subtle"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
