import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging Tailwind CSS classes with proper conflict resolution
 *
 * @param inputs - Array of class name strings or conditional class objects
 * @returns - Merged class string with properly resolved Tailwind conflicts
 *
 * Example usage:
 * cn('px-4 py-2', isActive && 'bg-blue-500', isFocused ? 'ring-2' : 'opacity-50')
 */
export function cn(...inputs: string[]) {
  return twMerge(clsx(inputs));
}
