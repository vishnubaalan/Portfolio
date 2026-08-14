/**
 * Turns an answer into follow-up action chips.
 *
 * The chat is a funnel into contact, not a toy: anything about hiring,
 * availability or cost must offer a way to actually reach Vishnu, and anything
 * about the work should offer the section that shows it.
 *
 * Chips are derived from the answer text rather than asked of the model, so
 * they cost no tokens and can never be hallucinated into a broken link.
 */

const RULES = [
  {
    id: 'email',
    test: /\b(hire|hiring|available|availability|freelance|contract|rate|salary|cost|budget|contact|reach|email|talk|call)\b/i,
  },
  {
    id: 'resume',
    test: /\b(resume|cv|experience|background|education|certification|career)\b/i,
  },
  {
    id: 'projects',
    test: /\b(drive|lms|project|built|build|clone|tracking|portfolio)\b/i,
  },
  {
    id: 'work',
    test: /\b(breezeware|dnyx|elgi|ibm|intern|internship|job|role|company)\b/i,
  },
  {
    id: 'skills',
    test: /\b(stack|skills|react|spring|java|tailwind|redux|aws|sql|learning)\b/i,
  },
];

/** Never crowd an answer — two chips read as helpful, five read as a menu. */
const MAX_ACTIONS = 2;

/**
 * @param {string} text
 * @returns {string[]} action ids, highest intent first
 */
export function deriveActions(text) {
  if (!text) return [];
  const matched = RULES.filter((rule) => rule.test.test(text)).map((rule) => rule.id);
  return matched.slice(0, MAX_ACTIONS);
}
