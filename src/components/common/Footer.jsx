import { Github, Linkedin, Mail, FileText, MapPin, ArrowUpRight, Code2, Trophy } from 'lucide-react';
import { SOCIAL_LINKS } from '../../data/links';
import { scrollToSection } from '../../hooks/useLenis';
import { useAppDispatch } from '../../hooks/redux';
import { setResumePreviewOpen } from '../../store/slices/uiSlice';

const ICON_MAP = { Github, Linkedin, Mail, FileText, Code2, Trophy };

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'ai-assistant', label: 'AI Assistant' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
];

const STACK = ['React 19', 'Vite', 'Tailwind', 'Framer Motion', 'R3F', 'Redux Toolkit'];

export function Footer() {
  const year = new Date().getFullYear();
  const dispatch = useAppDispatch();

  return (
    <footer className="relative mt-32 border-t border-border">
      {/* Subtle gradient wash at top of footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, oklch(0.66 0.20 252 / 0.06), transparent 70%)',
        }}
      />

      <div className="section-container relative pt-16 pb-8">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand column */}
          <div className="space-y-4">
            <button
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-2.5 text-left"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-text-inverse font-mono font-semibold">
                V
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-text">Vishnu Baalan</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-subtle">
                  React + Spring Boot Developer
                </span>
              </span>
            </button>

            <p className="max-w-sm text-sm leading-relaxed text-text-muted">
              I build React + Spring Boot admin dashboards, CRM systems and internal business
              tools for startups and small businesses. Currently a Software Engineer at Breezeware.
            </p>

            <div className="flex items-center gap-2 text-xs text-text-subtle">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Open to freelance projects
              <span className="mx-1 text-text-subtle/50">·</span>
              <MapPin className="h-3 w-3" />
              Coimbatore, India
            </div>
          </div>

          {/* Sitemap column */}
          <nav aria-label="Footer navigation" className="space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-text-subtle">
              Navigate
            </p>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm text-text-muted transition-colors hover:text-text"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect column */}
          <div className="space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-text-subtle">
              Connect
            </p>
            <ul className="space-y-2">
              {SOCIAL_LINKS.map((link) => {
                const Icon = ICON_MAP[link.icon] || Mail;
                const linkClass =
                  'group inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text';

                if (link.label === 'Resume') {
                  return (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => dispatch(setResumePreviewOpen(true))}
                        className={linkClass}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-text-subtle">
            © {year} Vishnu Baalan. All rights reserved.
          </p>
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-text-subtle">
            <span>Built with</span>
            {STACK.map((tech, i) => (
              <span key={tech} className="inline-flex items-center gap-1.5">
                <span className="font-mono text-text-muted">{tech}</span>
                {i < STACK.length - 1 && <span className="text-text-subtle/40">·</span>}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
