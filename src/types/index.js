/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} tagline
 * @property {string} description
 * @property {string[]} features
 * @property {string[]} tech
 * @property {'frontend'|'fullstack'} category
 * @property {string} [liveUrl]
 * @property {string} [repoUrl]
 * @property {boolean} [ongoing]
 * @property {string} [image]
 */

/**
 * @typedef {Object} SkillCategory
 * @property {string} name
 * @property {string[]} items
 * @property {string} color  Tailwind class or hex, used for chip accent
 */

/**
 * @typedef {Object} TimelineItem
 * @property {string} id
 * @property {string} title
 * @property {string} year
 * @property {string} description
 * @property {'past'|'current'|'future'} status
 */

/**
 * @typedef {Object} SocialLink
 * @property {string} label
 * @property {string} href
 * @property {string} icon  Lucide icon name
 */

/**
 * @typedef {Object} LearningTopic
 * @property {string} name
 * @property {number} progress  0-100
 * @property {string} description
 */

/**
 * @typedef {Object} ExperienceCapability
 * @property {string} title
 * @property {string} description
 * @property {string} icon  Lucide icon name
 */

/**
 * @typedef {Object} WorkExperience
 * @property {string} id
 * @property {string} company
 * @property {string} role
 * @property {string} dates       e.g. "Jun 2026 – Present"
 * @property {string} duration    e.g. "8 months" or "Current"
 * @property {boolean} [current]
 * @property {string} summary
 * @property {string[]} tech
 */

export {};
