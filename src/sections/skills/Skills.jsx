import { motion } from 'framer-motion';
import { SectionHeader } from '../../components/common/SectionHeader';
import { SKILL_CATEGORIES } from '../../data/skills';

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeader
          eyebrow="Toolkit"
          title="Skills & Tools"
          titleId="skills-heading"
          description="What I reach for daily, and what I'm actively deepening."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKILL_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.05 * idx, ease: [0.25, 1, 0.5, 1] }}
              className="group rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-primary/40"
            >
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: `var(--${cat.color})` }}
                />
                <h3 className="font-mono text-xs uppercase tracking-wider text-text-muted">
                  {cat.name}
                </h3>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border bg-bg/40 px-2.5 py-1 text-xs text-text-muted transition-colors group-hover:border-border-strong"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
