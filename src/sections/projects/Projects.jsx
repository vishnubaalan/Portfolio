import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Sparkles } from 'lucide-react';
import { PROJECTS } from '../../data/projects';
import { SectionHeader } from '../../components/common/SectionHeader';
import { cn } from '../../utils/cn';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'fullstack', label: 'Fullstack' },
  { id: 'frontend', label: 'Frontend' },
];

export function Projects() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  return (
    <section id="projects" aria-labelledby="projects-heading" className="relative py-24 sm:py-32">
      <div className="section-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Selected Work"
            title="Featured Projects"
            titleId="projects-heading"
            description="A slice of things I've shipped and things I'm currently building."
            className="mb-0"
          />
          <div className="flex items-center gap-1 rounded-full border border-border bg-surface/50 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium text-text-muted transition-colors',
                  filter === f.id && 'bg-primary text-text-inverse',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-card transition-colors hover:border-primary/40"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-semibold text-text">{project.title}</h3>
                      <p className="text-sm text-text-muted">{project.tagline}</p>
                    </div>
                    {project.ongoing && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                        <Sparkles className="h-2.5 w-2.5" />
                        Building
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-text-muted">{project.description}</p>

                  <ul className="flex flex-wrap gap-1.5">
                    {project.features.slice(0, 4).map((f) => (
                      <li
                        key={f}
                        className="rounded-full border border-border px-2 py-0.5 text-[11px] text-text-subtle"
                      >
                        {f}
                      </li>
                    ))}
                    {project.features.length > 4 && (
                      <li className="rounded-full px-2 py-0.5 text-[11px] text-text-subtle">
                        +{project.features.length - 4} more
                      </li>
                    )}
                  </ul>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-wrap gap-1">
                      {project.tech.map((t) => (
                        <span key={t} className="font-mono text-[10px] uppercase text-text-subtle">
                          {t}
                        </span>
                      )).reduce((acc, cur, i, arr) => [...acc, cur, i < arr.length - 1 && <span key={`${i}-sep`} className="text-text-subtle text-[10px]">·</span>], [])}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live`}
                          className="grid h-7 w-7 place-items-center rounded-full border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} repo`}
                          className="grid h-7 w-7 place-items-center rounded-full border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
                        >
                          <Github className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
