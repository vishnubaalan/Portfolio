/** @type {import('../types').Project[]} */
export const PROJECTS = [
  {
    id: 'drive',
    title: 'Drive',
    tagline: 'A Google Drive-style cloud storage app',
    description:
      'A fullstack cloud drive built from scratch — folders, uploads, sharing, trash lifecycle and a responsive grid/list UI. Persisted via SQL and served through a Spring Boot API with AWS-backed storage.',
    features: ['Folders', 'Search', 'Sharing', 'Trash', 'Downloads', 'Responsive Grid/List'],
    tech: ['React', 'Spring Boot', 'Java', 'SQL', 'AWS'],
    category: 'fullstack',
  },
  {
    id: 'lms',
    title: 'Learning Management System',
    tagline: 'Full LMS with admin, learners and distributors',
    description:
      'End-to-end LMS covering admin dashboards, learner management, distributor flows, authentication and reporting. Built the React frontend and the Spring Boot API together.',
    features: [
      'Admin Dashboard',
      'Learner Management',
      'Distributor Management',
      'Auth & Roles',
      'Responsive UI',
    ],
    tech: ['React', 'Spring Boot', 'Java', 'SQL'],
    category: 'fullstack',
  },
  {
    id: 'animal-tracking',
    title: 'Animal Tracking System',
    tagline: 'Locate, log and monitor animals in real time',
    description:
      'A fullstack tracking platform for animals — tag registration, live location, history logs and searchable records. React on the client, Spring Boot API and a relational store on the backend.',
    features: ['Live Tracking', 'History Logs', 'Search & Filters', 'Records Management'],
    tech: ['React', 'Spring Boot', 'Java', 'SQL'],
    category: 'fullstack',
  },
  {
    id: 'netflix-clone',
    title: 'Netflix Clone',
    tagline: 'The Netflix experience, rebuilt from scratch',
    description:
      'A frontend clone of Netflix — carousels, hover previews, category rows, responsive video tiles and a polished browsing experience. Sharpened my instincts for animation, layout and streaming-style UX.',
    features: ['Carousels', 'Hover Previews', 'Responsive Grid', 'Video Tiles'],
    tech: ['React', 'TailwindCSS', 'JavaScript'],
    category: 'frontend',
  },
  {
    id: 'spotify-clone',
    title: 'Spotify Clone',
    tagline: 'A pixel-inspired take on the Spotify UI',
    description:
      'A frontend Spotify clone — sidebar navigation, playlists, now-playing bar and a fluid audio player. Focused on responsiveness, dark aesthetics and interaction polish.',
    features: ['Playlists', 'Audio Player', 'Now Playing', 'Sidebar Navigation'],
    tech: ['React', 'TailwindCSS', 'JavaScript'],
    category: 'frontend',
  },
];
