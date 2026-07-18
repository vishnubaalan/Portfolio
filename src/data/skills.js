/** @type {import('../types').SkillCategory[]} */
export const SKILL_CATEGORIES = [
  {
    name: 'Frontend',
    color: 'primary',
    items: [
      'React',
      'TypeScript',
      'JavaScript',
      'HTML5',
      'CSS3',
      'TailwindCSS',
      'shadcn/ui',
      'Framer Motion',
      'Responsive Design',
      'Accessibility',
    ],
  },
  {
    name: 'State Management',
    color: 'accent',
    items: ['Redux', 'Zustand', 'Context API'],
  },
  {
    name: 'Cloud',
    color: 'info',
    items: ['AWS Amplify', 'AWS Cognito', 'Authentication'],
  },
  {
    name: 'UI Libraries',
    color: 'primary',
    items: ['Material UI', 'Lucide React', 'Konva', 'React Konva', 'Milkdown'],
  },
  {
    name: 'Tools',
    color: 'success',
    items: ['Git', 'GitHub', 'VS Code', 'Ubuntu Linux', 'Chrome DevTools', 'Figma'],
  },
  {
    name: 'Currently Learning',
    color: 'warning',
    items: ['Java', 'Spring Boot', 'Networking', 'System Design', 'AI Engineering', 'GOAP', 'LLMs'],
  },
];
