import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// UI utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Common table interface with improved type safety
export interface TableProps<T = string | number> {
  headers: string[];
  rows: T[][];
  sortable?: boolean;
  filterable?: boolean;
}

// Currency and number formatting utilities
export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculatePercentage(base: number, total: number) {
  return total === 0 ? 0 : Math.round((base / total) * 100);
}

// Export format types
export const exportFormats = ['CSV', 'Excel', 'PDF', 'JSON'] as const;
export type ExportFormat = (typeof exportFormats)[number];

// Chart configuration types
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  animation?: boolean;
}

// Common UI component props
export interface CommonUIProps {
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  loading?: boolean;
}

// Responsive breakpoint utilities
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Theme configuration types
export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}
