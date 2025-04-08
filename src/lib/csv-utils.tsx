// lib/csv-utils.tsx
import Papa from 'papaparse';
import { toast } from '@/hooks/use-toast';

const BATCH_SIZE = 1000; // Process 1000 rows at a time
const CACHE_KEY_PREFIX = 'csv_cache_';

export interface CsvRow {
  asin: string;
  price: string;
  reviews: string;
  rating: string;
  conversion_rate: string;
  click_through_rate: string;
  brands: string;
  keywords: string;
  niche: string;
}

export interface ProcessedRow {
  asin: string;
  price: number;
  reviews: number;
  rating: number;
  conversion_rate: number;
  click_through_rate: number;
  brands: string;
  keywords: string;
  niche: string;
}

const REQUIRED_CSV_HEADERS = [
  'asin',
  'price',
  'reviews',
  'rating',
  'conversion_rate',
  'click_through_rate',
  'brands',
  'keywords',
  'niche',
];

export const processCsvData = (csvData: CsvRow[]): ProcessedRow[] => {
  return csvData.map((row) => ({
    asin: row.asin,
    price: parseFloat(row.price),
    reviews: parseInt(row.reviews),
    rating: parseFloat(row.rating),
    conversion_rate: parseFloat(row.conversion_rate),
    click_through_rate: parseFloat(row.click_through_rate),
    brands: row.brands,
    keywords: row.keywords,
    niche: row.niche,
  }));
};

interface ParseProgress {
  processed: number;
  total: number;
  currentBatch: number;
}

export const getCacheKey = (file: File): string => {
  return `${CACHE_KEY_PREFIX}${file.name}_${file.size}_${file.lastModified}`;
};

export const parseAndValidateCsv = async <T extends CsvRow>(
  file: File,
  onProgress?: (progress: ParseProgress) => void,
): Promise<{ data: T[]; error: string | null }> => {
  // Check cache first
  const cacheKey = getCacheKey(file);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsedCache = JSON.parse(cached);
      return { data: parsedCache as T[], error: null };
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }
  return new Promise((resolve) => {
    let processedRows: T[] = [];
    let currentBatch = 0;
    
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      chunk: (results, parser) => {
        const rows = results.data as T[];
        processedRows = [...processedRows, ...rows];
        currentBatch++;
        
        if (onProgress) {
          onProgress({
            processed: processedRows.length,
            total: -1, // Unknown total until complete
            currentBatch,
          });
        }
        
        // Process in batches to avoid blocking the UI
        if (processedRows.length >= BATCH_SIZE) {
          parser.pause();
          setTimeout(() => parser.resume(), 0);
        }
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          resolve({
            data: [],
            error: `CSV parsing errors: ${results.errors
              .map((e) => e.message)
              .join(', ')}`,
          });
          return;
        }

        const missingHeaders = REQUIRED_CSV_HEADERS.filter((h) =>
          results.meta.fields ? !results.meta.fields.includes(h) : true,
        );
        if (missingHeaders.length > 0) {
          resolve({
            data: [],
            error: `Missing required columns: ${missingHeaders.join(', ')}`,
          });
          return;
        }

        const processedData = processCsvData(processedRows);
        
        // Cache the results
        try {
          localStorage.setItem(cacheKey, JSON.stringify(processedData));
        } catch (e) {
          console.warn('Failed to cache CSV data:', e);
        }
        
        if (onProgress) {
          onProgress({
            processed: processedData.length,
            total: processedData.length,
            currentBatch,
          });
        }
        
        resolve({ data: processedData as T[], error: null });
      },
      error: (error) => {
        resolve({ data: [], error: `Error parsing CSV: ${error.message}` });
      },
    });
  });
};
