import { motion } from 'framer-motion';
import { Sparkles, Mic, Zap, Brain, Workflow, Layers, Cpu, Bell, Target } from 'lucide-react';
import { SectionHeader } from '../../components/common/SectionHeader';

const FEATURES = [
  { icon: Mic, label: 'Voice Interaction' },
  { icon: Zap, label: 'Task Automation' },
  { icon: Brain, label: 'Long-Term Memory' },
  { icon: Workflow, label: 'Workflow Execution' },
  { icon: Layers, label: 'Cross-Platform' },
  { icon: Cpu, label: 'Local AI Integration' },
  { icon: Bell, label: 'Smart Notifications' },
];

export function AIAssistant() {
  return (
    <section id="ai-assistant" className="relative py-24 sm:py-32 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, oklch(0.65 0.22 275 / 0.18), transparent 60%)',
        }}
      />

      <div className="section-container relative">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Actively Building
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">
            <Target className="h-3 w-3" />
            My mission — completing this end-to-end
          </span>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="The Working Project"
              title="Personal AI Assistant"
              description="This is the one I'm building right now — my current focus and the project I'm committed to seeing through to completion. Inspired by Jarvis, it's a personal AI companion for productivity, automation, coding, and daily workflows, built around Goal-Oriented Action Planning (GOAP) so it can reason and act, not just chat."
              className="mb-8"
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: 0.04 * i }}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 p-3"
                >
                  <f.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs text-text-muted">{f.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-surface/40 p-5">
              <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-text-subtle">
                <Sparkles className="h-3 w-3 text-primary" />
                Why I'm building it
              </p>
              <p className="text-sm leading-relaxed text-text-muted">
                Every product I've shipped has been for someone else. This one is for me — an assistant
                that grows with my workflow, remembers what matters, and takes the boring parts off my plate
                so I can focus on the interesting ones. Completing this isn't a milestone; it's the goal.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            className="relative aspect-square w-full max-w-md mx-auto"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-3xl" />
            <div className="relative flex h-full items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '3s' }} />
                <div className="relative grid h-40 w-40 place-items-center rounded-full glass shadow-glow-primary">
                  <Cpu className="h-16 w-16 text-primary" />
                </div>
                <div className="absolute -inset-6 rounded-full border border-primary/20" />
                <div className="absolute -inset-12 rounded-full border border-accent/10" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
