import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names — merges Tailwind conflicts.
 * @param {...import('clsx').ClassValue} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
