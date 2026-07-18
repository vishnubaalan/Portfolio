import { Heart, Github, Linkedin, Mail, FileText } from 'lucide-react';
import { SOCIAL_LINKS } from '../../data/links';

const ICON_MAP = { Github, Linkedin, Mail, FileText };

const STACK = ['React', 'Vite', 'TailwindCSS', 'Framer Motion', 'R3F', 'Redux Toolkit'];

export function Footer() {
  return (
    <footer className="border-t border-border py-12 mt-24">
      <div className="section-container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm text-text-muted">
            Made with <Heart className="h-3.5 w-3.5 fill-danger text-danger" /> by
            <span className="font-medium text-text">Vishnu Baalan</span>
          </p>
          <p className="text-xs text-text-subtle">
            Built with {STACK.join(' · ')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {SOCIAL_LINKS.map((link) => {
            const Icon = ICON_MAP[link.icon] || Mail;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
