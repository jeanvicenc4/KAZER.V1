import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Re-export the shared KAZER core utilities so web components can import
 * everything from one place while still sharing a single implementation
 * with kazer-mobile.
 */
export {
  groupConversations,
  formatRelativeDate,
  formatBytes,
  formatPriceBRL,
  formatDuration,
  initials,
  domainInitials,
} from '@kazer/core';
export type { HistoryGroup } from '@kazer/core';
