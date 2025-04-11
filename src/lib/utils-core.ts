import { type ClassValue, clsx } from 'clsx';
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

// CSV-related types and utilities
export interface CsvParseOptions {
  header?: boolean;
  skipEmptyLines?: boolean;
  transformHeader?: (header: string) => string;
}

export interface CsvExportOptions {
  fileName?: string;
  includeHeaders?: boolean;
  delimiter?: string;
}

// Re-export enhanced CSV functionality with better type definitions
export { parseCSV, type BatchProcessingOptions, type ProcessingResult } from './enhanced-csv-utils';
