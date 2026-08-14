import { motion } from 'framer-motion';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PUBLIC_FAQ } from '../../data/ai/faq';

/**
 * The same answers the AI panel gives, rendered as real HTML.
 *
 * Deliberately always-visible rather than an accordion: this section exists so
 * the answers are in the document for crawlers and for visitors who never open
 * the chat, and collapsed content is weighted less reliably.
 */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions I get asked"
          titleId="faq-heading"
          description="The short answers. Ask my AI assistant above if you want to dig into any of them."
        />

        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PUBLIC_FAQ.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.05 * idx, ease: [0.25, 1, 0.5, 1] }}
              className="rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-primary/40"
            >
              <dt className="mb-2 text-base font-semibold text-text">{entry.q}</dt>
              <dd className="text-sm leading-relaxed text-text-muted">{entry.a}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
