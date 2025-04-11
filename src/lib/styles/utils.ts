import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Theme-related utilities
export const getThemeClass = (isDark: boolean, type: 'bg' | 'accent' | 'shadow') => {
  const suffix = isDark ? 'dark' : 'light';
  switch (type) {
    case 'bg':
      return `bg-premium-${suffix}`;
    case 'accent':
      return `bg-accent-overlay-${suffix}`;
    case 'shadow':
      return `shadow-premium-${suffix}`;
    default:
      return '';
  }
};

// Brand color utilities
export const getBrandColor = (type: 'blue' | 'orange') => {
  return type === 'blue' ? 'var(--brand-blue)' : 'var(--brand-orange)';
};

// Pattern utilities
export const getPatternClass = (withPattern: boolean) => {
  return withPattern ? 'bg-pattern' : '';
};

// Transition utilities
export const getTransitionClass = () => {
  return 'transition-premium';
};
