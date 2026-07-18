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
    dates: 'Aug 2025 – May 2026',
    duration: '10 months',
    summary:
      'Contributed to real production features across the React and Spring Boot stack. Learned real-world engineering practices — code reviews, delivery cycles, and shipping under constraints.',
    tech: ['React', 'Spring Boot', 'Java', 'SQL'],
  },
  {
    id: 'dnyx',
    company: 'DNYX Business Solution',
    role: 'Full Stack Developer Intern',
    dates: 'Jul 2024 – Nov 2024',
    duration: '5 months',
    summary:
      'Developed and optimised web applications with Next.js and React.js. Integrated APIs and databases for backend functionality. Contributed to team code reviews and debugging cycles.',
    tech: ['Next.js', 'React', 'Node.js', 'REST APIs'],
  },
  {
    id: 'elgi',
    company: 'ELGi Equipments Ltd',
    role: 'Web Developer Intern',
    dates: 'Feb 2024 – Jul 2024',
    duration: '6 months',
    summary:
      'Worked on a Digital Twin project — a web-based simulation for real-time monitoring and analysis. Enhanced UX and system efficiency, collaborating with a team on delivery.',
    tech: ['HTML', 'CSS', 'JavaScript'],
  },
  {
    id: 'ibm-genai',
    company: 'IBM SkillsBuild',
    role: 'GenAI & Data Science Micro Intern',
    dates: 'Feb 2024 – Mar 2024',
    duration: '2 months',
    summary:
      'Interdisciplinary AI micro-internship focused on GenAI and data science. Contributed to predictive modelling and analysis workflows.',
    tech: ['Python', 'GenAI', 'Data Science'],
  },
];
