import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home,
  User,
  Sparkles,
  FolderKanban,
  Cpu,
  Briefcase,
  Github,
  Linkedin,
  Mail,
  FileText,
  Code2,
  Trophy,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setPaletteOpen, setResumePreviewOpen } from '../../store/slices/uiSlice';
import { setMode } from '../../store/slices/themeSlice';
import { scrollToSection } from '../../hooks/useLenis';
import { SOCIAL_LINKS } from '../../data/links';

const SECTION_ITEMS = [
  { id: 'hero', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Cpu },
  { id: 'work', label: 'Work Experience', icon: Briefcase },
  { id: 'contact', label: 'Contact', icon: Mail },
];

const ICON_MAP = { Github, Linkedin, Mail, FileText, Code2, Trophy };

export function CommandPalette() {
  const open = useAppSelector((s) => s.ui.paletteOpen);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handler = (e) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatch(setPaletteOpen(!open));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const close = () => dispatch(setPaletteOpen(false));

  const jump = (id) => {
    close();
    setTimeout(() => scrollToSection(id), 100);
  };

  const setTheme = (mode) => {
    dispatch(setMode(mode));
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => dispatch(setPaletteOpen(v))}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[200]"
                style={{ background: 'var(--scrim)' }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                data-lenis-prevent
                className="fixed left-1/2 top-[10vh] z-[201] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl glass shadow-elevated"
              >
                <VisuallyHidden asChild>
                  <Dialog.Title>Command Palette</Dialog.Title>
                </VisuallyHidden>
                <VisuallyHidden asChild>
                  <Dialog.Description>
                    Jump to sections, switch theme, or open external links.
                  </Dialog.Description>
                </VisuallyHidden>

                <Command loop>
                  <div className="border-b border-border px-4">
                    <Command.Input
                      autoFocus
                      placeholder="Search sections, actions..."
                      className="h-12 w-full bg-transparent text-sm text-text placeholder:text-text-subtle focus:outline-none"
                    />
                  </div>
                  <Command.List
                    data-lenis-prevent
                    className="max-h-80 overflow-y-auto overscroll-contain p-2"
                  >
                    <Command.Empty className="py-6 text-center text-sm text-text-muted">
                      No results found.
                    </Command.Empty>

                    <Command.Group
                      heading="Navigate"
                      className="px-1 pb-2 text-[11px] uppercase tracking-wider text-text-subtle"
                    >
                      {SECTION_ITEMS.map((item) => (
                        <Command.Item
                          key={item.id}
                          onSelect={() => jump(item.id)}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted aria-selected:bg-surface-2 aria-selected:text-text"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Command.Item>
                      ))}
                    </Command.Group>

                    <Command.Group
                      heading="Theme"
                      className="px-1 pb-2 pt-1 text-[11px] uppercase tracking-wider text-text-subtle"
                    >
                      <Command.Item
                        onSelect={() => setTheme('light')}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted aria-selected:bg-surface-2 aria-selected:text-text"
                      >
                        <Sun className="h-4 w-4" /> Light
                      </Command.Item>
                      <Command.Item
                        onSelect={() => setTheme('dark')}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted aria-selected:bg-surface-2 aria-selected:text-text"
                      >
                        <Moon className="h-4 w-4" /> Dark
                      </Command.Item>
                      <Command.Item
                        onSelect={() => setTheme('system')}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted aria-selected:bg-surface-2 aria-selected:text-text"
                      >
                        <Monitor className="h-4 w-4" /> System
                      </Command.Item>
                    </Command.Group>

                    <Command.Group
                      heading="Links"
                      className="px-1 pt-1 text-[11px] uppercase tracking-wider text-text-subtle"
                    >
                      {SOCIAL_LINKS.map((link) => {
                        const Icon = ICON_MAP[link.icon] || Mail;
                        const handleSelect =
                          link.label === 'Resume'
                            ? () => {
                                close();
                                dispatch(setResumePreviewOpen(true));
                              }
                            : () => {
                                window.open(link.href, '_blank', 'noopener,noreferrer');
                                close();
                              };
                        return (
                          <Command.Item
                            key={link.label}
                            onSelect={handleSelect}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted aria-selected:bg-surface-2 aria-selected:text-text"
                          >
                            <Icon className="h-4 w-4" />
                            {link.label}
                          </Command.Item>
                        );
                      })}
                    </Command.Group>
                  </Command.List>
                  <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-text-subtle">
                    <span>↑↓ navigate · ↵ select · esc close</span>
                    <span className="font-mono">⌘K</span>
                  </div>
                </Command>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
