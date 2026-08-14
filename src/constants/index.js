export const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'ai-assistant', label: 'AI Assistant' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
];

// Rendered after "I build" in the hero — every entry has to read as a thing a
// client would pay for, not a job title.
export const TYPING_WORDS = [
  'Admin Dashboards',
  'Internal Business Tools',
  'CRM Systems',
  'Analytics Dashboards',
  'User Management Panels',
];

// The niche, stated the same way everywhere: hero chips, contact section, pitch.
export const OFFERINGS = [
  'Admin Dashboards',
  'Internal Business Tools',
  'CRM Systems',
  'Analytics Dashboards',
  'User Management Panels',
];

export const TAGLINE = 'React + Spring Boot Admin Dashboard Developer';

export const PITCH =
  'I build fast, secure React + Spring Boot admin dashboards and internal business tools for startups and small businesses.';

// Drop the latest resume PDF into /public/resume.pdf and this link will just work.
export const RESUME_URL = '/resume.pdf';

export const GITHUB_USERNAME = 'vishnubaalan';

// `import.meta.env` is undefined outside Vite — the /api/chat proxy imports this
// module (via the AI knowledge base) and runs in a plain ESM runtime.
const env = import.meta.env || {};

export const EMAILJS = {
  serviceId: env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: env.VITE_EMAILJS_PUBLIC_KEY || '',
};
