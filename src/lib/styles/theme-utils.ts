import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Premium theme utility functions
export const getPremiumClasses = (variant: 'light' | 'dark' = 'light', withPattern = false) => {
  const baseClasses = variant === 'light' ? 'bg-premium-light' : 'bg-premium-dark';
  const patternClasses = withPattern ? 'bg-premium-pattern' : '';
  return cn(baseClasses, patternClasses, 'shadow-premium');
};

// Accent overlay utility
export const getAccentOverlay = (interactive = true) => {
  return cn('bg-accent-overlay', interactive && 'hover:bg-accent-overlay-hover');
};

// Accessibility helper functions
export const getAccessibleTextColor = (bgColor: string) => {
  // Simple contrast check - can be expanded based on needs
  const isDark = bgColor.toLowerCase() === '#146eb4';
  return isDark ? 'text-white' : 'text-premium-contrast';
};

// Theme transition utility
export const getThemeTransition = () => {
  return 'transition-all duration-300 ease-in-out';
};
