import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Briefcase } from 'lucide-react';
import { SectionHeader } from '../../components/common/SectionHeader';
import { EXPERIENCE } from '../../data/experience';

export function Experience() {
  return (
    <section id="experience" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeader
          eyebrow="Capabilities"
          title="Engineering Experience"
          description="Skills sharpened both by shipping personal projects and by day-to-day engineering work at Breezeware — production React, Spring Boot APIs, cloud, auth, and design systems at real-product scale."
        />

        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">
          <Briefcase className="h-3 w-3" />
          Currently engineering @ Breezeware
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCE.map((item, i) => {
            const Icon = Icons[item.icon] || Icons.Sparkles;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.04 * i, ease: [0.25, 1, 0.5, 1] }}
                whileHover={{ y: -3 }}
                className="group rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-accent/40"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-colors group-hover:from-primary/30 group-hover:to-accent/30">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-text">{item.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
