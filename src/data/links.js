import { RESUME_URL, GITHUB_USERNAME } from '../constants';

export const CONTACT_EMAIL = 'vishnubaalan.b@gmail.com';

/**
 * Opens Gmail's web compose window directly with the recipient pre-filled,
 * instead of the OS default mail client. Works whether the visitor is signed
 * into Gmail or not — Gmail will prompt for login if needed.
 */
export const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}`;

/** @type {import('../types').SocialLink[]} */
export const SOCIAL_LINKS = [
  { label: 'GitHub', href: `https://github.com/${GITHUB_USERNAME}`, icon: 'Github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vishnubaalan/', icon: 'Linkedin' },
  { label: 'LeetCode', href: 'https://leetcode.com/u/vishnubaalan', icon: 'Code2' },
  { label: 'HackerRank', href: 'https://shorturl.at/dkak7', icon: 'Trophy' },
  { label: 'Email', href: GMAIL_COMPOSE_URL, icon: 'Mail' },
  { label: 'Resume', href: RESUME_URL, icon: 'FileText' },
];
