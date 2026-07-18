/**
 * @typedef {import('../types').WorkExperience} WorkExperience
 */

/** @type {WorkExperience[]} — most recent first (reverse chronological). */
export const WORK = [
  {
    id: 'breezeware-fulltime',
    company: 'Breezeware',
    role: 'Software Engineer',
    dates: 'Jun 2026 – Present',
    duration: 'Current',
    current: true,
    summary:
      'Converted from the internship into a full-time role. Building production React frontends and Spring Boot APIs across client and internal products.',
    tech: ['React', 'Spring Boot', 'Java', 'SQL', 'AWS'],
  },
  {
    id: 'breezeware-intern',
    company: 'Breezeware',
    role: 'Software Engineer Intern',
    dates: 'Oct 2025 – May 2026',
    duration: '8 months',
    summary:
      'Contributed to real production features across the React and Spring Boot stack. Learned real-world engineering practices — code reviews, delivery cycles, and shipping under constraints.',
    tech: ['React', 'Spring Boot', 'Java', 'SQL'],
  },
  {
    id: 'dnyx',
    company: 'DNYX Private Ltd',
    role: 'Frontend Engineer',
    dates: 'Jul 2025 – Sep 2025',
    duration: '3 months',
    summary:
      'Built React user interfaces and shipped frontend features against fast turnaround times.',
    tech: ['React', 'JavaScript', 'TailwindCSS'],
  },
  {
    id: 'elgi',
    company: 'ELGi Equipments Ltd',
    role: 'Intern',
    dates: 'Jan 2025 – Jun 2025',
    duration: '6 months',
    summary:
      'First professional experience — exposure to enterprise engineering workflows at an industrial equipment company.',
    tech: [],
  },
];
