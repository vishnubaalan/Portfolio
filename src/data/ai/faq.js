/**
 * Seeded Q→A pairs. Two jobs:
 *   1. Source of the suggestion chips shown in the empty state, the teaser and
 *      the quota wall.
 *   2. The offline answerer — when the key is missing, the API is down, or the
 *      visitor has used all 10 questions for the day, `matchFaq()` keeps the
 *      panel useful instead of letting it become a dead box in front of a
 *      recruiter.
 *
 * Answers are written in Vishnu's voice and must obey the same rules as the
 * model: no invented numbers, no repo links for Drive or the LMS.
 */

import { CONTACT_EMAIL } from '../links';
import { AVAILABILITY } from './persona';

/**
 * @typedef {Object} FaqEntry
 * @property {string} id
 * @property {string} q          The chip label / canonical question
 * @property {string} a          The offline answer
 * @property {string[]} keywords Lowercase tokens used for matching
 * @property {boolean} [chip]    Show as a suggestion chip
 */

/** @type {FaqEntry[]} */
export const FAQ = [
  {
    id: 'who',
    q: 'Who are you?',
    a: "I'm Vishnu Baalan B — a software engineer in Coimbatore building React + Spring Boot admin dashboards and internal business tools. I'm at Breezeware full-time, and I'm building a Jarvis-style personal AI assistant on the side.",
    keywords: ['who', 'about', 'yourself', 'introduce', 'name'],
  },
  {
    id: 'build',
    q: 'What do you build?',
    a: 'Admin dashboards, internal business tools, CRM systems, analytics dashboards and user management panels — fast, secure, and built for startups and small businesses. React on the front, Spring Boot and SQL behind it.',
    keywords: ['build', 'do', 'make', 'work on', 'services', 'offer'],
    chip: true,
  },
  {
    id: 'stack',
    q: "What's your stack?",
    a: 'React, JavaScript, Tailwind, shadcn/ui, Redux Toolkit and Framer Motion on the frontend. Java 17/21 with Spring Boot, REST APIs and SQL on the backend. AWS — Amplify, Cognito, S3, CloudFront — for deployment.',
    keywords: ['stack', 'tech', 'technologies', 'tools', 'languages', 'framework'],
    chip: true,
  },
  {
    id: 'drive',
    q: 'Walk me through Drive',
    a: 'Drive is a Google Drive-style cloud storage app I built end to end — folders, uploads, sharing, a trash lifecycle and a responsive grid/list UI. React on the client, a Spring Boot API behind it, SQL for persistence and AWS-backed storage. It was my first real fullstack build, and it is private work, so there is no public repo — happy to walk you through it over a call.',
    keywords: ['drive', 'cloud storage', 'file manager', 'file management'],
    chip: true,
  },
  {
    id: 'lms',
    q: "What's the LMS?",
    a: 'An end-to-end learning management system covering admin dashboards, learner management, distributor flows, auth and roles, and reporting. I built both the React frontend and the Spring Boot API. It is private work, so there is no public repository.',
    keywords: ['lms', 'learning management', 'learner', 'distributor'],
  },
  {
    id: 'ai-assistant',
    q: "What's the AI assistant project?",
    a: "It's my flagship — a personal, Jarvis-style AI assistant built around Goal-Oriented Action Planning, so it reasons about goals and acts rather than just chatting. Voice, task automation, long-term memory, workflow execution, local AI. It's actively being built, and it's the reason the rest of my learning path looks the way it does.",
    keywords: ['jarvis', 'ai assistant', 'goap', 'assistant', 'agent', 'flagship'],
  },
  {
    id: 'where-work',
    q: 'Where do you work now?',
    a: "I'm a Software Engineer at Breezeware, remote — I converted from a 10-month internship into the full-time role. I work across production React frontends and Spring Boot APIs on client and internal products.",
    keywords: ['where', 'work', 'company', 'employer', 'breezeware', 'job', 'currently'],
  },
  {
    id: 'experience',
    q: 'How much experience do you have?',
    a: 'Professionally: Breezeware since Aug 2025 — 10 months as an intern, then full-time from Jun 2026. Before that, a 5-month fullstack internship at DNYX Business Solution, 6 months at ELGi Equipments on a Digital Twin dashboard, and a GenAI micro-internship with IBM SkillsBuild.',
    keywords: ['experience', 'years', 'how long', 'senior', 'junior', 'background'],
  },
  {
    id: 'available',
    q: 'Are you available for work?',
    a: `${AVAILABILITY} Easiest way in is email — ${CONTACT_EMAIL}.`,
    keywords: ['available', 'hire', 'hiring', 'freelance', 'job', 'opportunity', 'contract', 'open to'],
    chip: true,
  },
  {
    id: 'frontend-backend',
    q: 'Frontend or backend?',
    a: "Both, genuinely — that's the point of the fullstack path. Frontend is where I have the most polish (React, accessibility, motion, design systems), and Spring Boot is where I do the API and data work. Dashboards need both done well.",
    keywords: ['frontend', 'backend', 'fullstack', 'prefer', 'stronger', 'better at'],
  },
  {
    id: 'learning',
    q: 'What are you learning?',
    a: 'System design and networking right now — the foundation for designing systems that scale, not just apps that work. Alongside that: AI engineering, LLMs and GOAP, which feed straight into the personal assistant project.',
    keywords: ['learning', 'studying', 'next', 'improve', 'growing', 'currently learning'],
  },
  {
    id: 'code',
    q: 'Where can I see your code?',
    a: 'GitHub is github.com/vishnubaalan — that is the learning trail: clones, experiments and this portfolio itself. The production work is at Breezeware and the Drive and LMS builds are private, so the strongest evidence is a walkthrough rather than a repo link. Ask me and I will show you.',
    keywords: ['code', 'github', 'repo', 'repository', 'source', 'portfolio code'],
  },
  {
    id: 'contact',
    q: 'How do I contact you?',
    a: `Email is best — ${CONTACT_EMAIL}, and I reply personally. If it's urgent, call or message +91 90921 53915. LinkedIn works too: linkedin.com/in/vishnubaalan.`,
    keywords: ['contact', 'reach', 'email', 'phone', 'call', 'number', 'get in touch', 'linkedin'],
  },
  {
    id: 'location',
    q: 'Where are you based?',
    a: "Coimbatore, Tamil Nadu, India — and I've worked remote across every role so far, so timezone-friendly remote work is normal for me.",
    keywords: ['based', 'location', 'where are you', 'city', 'country', 'remote', 'timezone'],
  },
];

/** Chips shown in the empty state, the teaser and the quota wall. */
export const CHIP_QUESTIONS = FAQ.filter((f) => f.chip).map((f) => f.q);

const STOP_WORDS = new Set([
  'what', 'whats', 'is', 'are', 'the', 'a', 'an', 'do', 'does', 'you', 'your',
  'me', 'my', 'i', 'can', 'could', 'would', 'tell', 'about', 'for', 'of', 'to',
  'and', 'in', 'on', 'with', 'how', 'much', 'many', 'please',
]);

/**
 * Keyword-scored FAQ lookup used by every degraded path.
 *
 * @param {string} input
 * @returns {FaqEntry | null} Best match, or null when nothing scores.
 */
export function matchFaq(input) {
  const text = String(input || '').toLowerCase();
  if (!text.trim()) return null;

  const words = text
    .split(/[^a-z0-9+#]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  let best = null;
  let bestScore = 0;

  for (const entry of FAQ) {
    let score = 0;
    for (const kw of entry.keywords) {
      // Multi-word keywords are strong signals; single words score per hit.
      if (kw.includes(' ')) {
        if (text.includes(kw)) score += 3;
      } else if (words.includes(kw)) {
        score += 2;
      } else if (text.includes(kw)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore >= 2 ? best : null;
}

/** Answer shown when `matchFaq` finds nothing and no model is available. */
export const FAQ_MISS = `That one's outside what I can answer offline. Email me at ${CONTACT_EMAIL} and I'll answer it properly — or ask me about my stack, my projects, or whether I'm available.`;
