import { RESUME_URL, GITHUB_USERNAME } from '../constants';

/** @type {import('../types').SocialLink[]} */
export const SOCIAL_LINKS = [
  { label: 'GitHub', href: `https://github.com/${GITHUB_USERNAME}`, icon: 'Github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vishnubaalan/', icon: 'Linkedin' },
  { label: 'Email', href: 'mailto:vishnubaalan@example.com', icon: 'Mail' },
  { label: 'Resume', href: RESUME_URL, icon: 'FileText' },
];

export const CONTACT_EMAIL = 'vishnubaalan@example.com';
