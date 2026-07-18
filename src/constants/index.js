export const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'ai-assistant', label: 'AI Assistant' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'github', label: 'GitHub' },
  { id: 'learning', label: 'Learning' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'contact', label: 'Contact' },
];

export const TYPING_WORDS = [
  'Software Engineer',
  'Fullstack Developer',
  'AI Agent Builder',
  'Systems Thinker',
  'Continuous Learner',
];

// Drop the latest resume PDF into /public/resume.pdf and this link will just work.
export const RESUME_URL = '/resume.pdf';

export const GITHUB_USERNAME = 'vishnubaalan';

/**
 * Featured GitHub repos to surface in the Public Repositories section.
 * Matched case-insensitively as substrings — works for `animal-tracker`,
 * `animal-tracking`, `netflix-clone`, `netflix`, etc.
 * Order here is the display order.
 */
export const FEATURED_REPOS = [
  'animal',
  'weather',
  'spotify',
  'netflix',
  'lms',
  'todo',
];

export const EMAILJS = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
};
