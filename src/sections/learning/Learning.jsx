import { motion } from 'framer-motion';
import { SectionHeader } from '../../components/common/SectionHeader';
import { LEARNING } from '../../data/learning';

export function Learning() {
  return (
    <section id="learning" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeader
          eyebrow="Journey"
          title="Currently Learning"
          description="A rough sense of where I am with each topic. All numbers reflect confidence, not completion."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {LEARNING.map((topic, i) => (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.04 * i }}
              className="rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-text">{topic.name}</h3>
                <span className="font-mono text-xs text-text-muted">{topic.progress}%</span>
              </div>
              <p className="mb-3 text-xs text-text-muted">{topic.description}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${topic.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.1 + 0.04 * i, ease: [0.25, 1, 0.5, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
