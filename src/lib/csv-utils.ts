import Papa from 'papaparse';
import { toast } from '@/hooks/use-toast';
import { CsvSchema, csvSchemas } from './validation-utils';
import { ValidationError, AggregateError } from './amazon-errors';
import { CsvSchemaValidator, type CsvSchemaDefinition } from './schema-validation';
import { getSchema, validateSchemaKey, type SchemaKey } from './schema-registry';

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

export interface BatchProcessingOptions {
  batchSize?: number;
  memoryThreshold?: number;
  retryAttempts?: number;
  cacheResults?: boolean;
  validateRow?: (row: Record<string, unknown>) => boolean;
}

export interface ProcessingProgress {
  processedRows: number;
  totalRows: number;
  currentBatch: number;
  errorCount: number;
  memoryUsage: number;
  status: 'processing' | 'completed' | 'error';
}

export interface ProcessingResult<T> {
  data: T[];
  errors: ProcessingError[];
  stats: {
    totalProcessed: number;
    errorCount: number;
    processingTime: number;
    memoryPeak: number;
  };
}

interface ProcessingError {
  row: number;
  error: string;
  data?: Record<string, unknown>;
}

const DEFAULT_OPTIONS: BatchProcessingOptions = {
  batchSize: 1000,
  memoryThreshold: 100 * 1024 * 1024, // 100MB
  retryAttempts: 3,
  cacheResults: true,
};

export function generateExportFilename(toolName: string, format: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `${toolName.replace(/ /g, '-')}_${date}.${format.toLowerCase()}`;
}

export function parseCsvValue(value: string, schemaType?: 'string' | 'number' | 'date'): unknown {
  // Handle quoted values and escaped characters
  const parsed = Papa.parse(value, {
    delimiter: '',
    escapeChar: '\\',
    skipEmptyLines: true,
    transform: val => val.trim(),
  }).data[0][0];

  if (schemaType === 'number') {
    const num = parseFloat(parsed.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  }
  if (schemaType === 'date') {
    const date = new Date(parsed);
    return isNaN(date.getTime()) ? parsed : date;
  }
  return parsed;
}

export function validateCsvAgainstSchema(
  data: Record<string, unknown>[],
  headers: string[],
  schema: CsvSchema
): void {
  const errors: ValidationError[] = [];

  // Validate headers first
  const schemaColumns = Object.keys(schema.columns);
  if (schema.strictMode) {
    headers.forEach(header => {
      if (!schemaColumns.includes(header)) {
        errors.push(new ValidationError(`Unexpected column: ${header}`));
      }
    });
  }

  schemaColumns.forEach(column => {
    if (schema.columns[column].required && !headers.includes(column)) {
      errors.push(new ValidationError(`Missing required column: ${column}`));
    }
  });

  // Validate rows if header checks passed
  if (errors.length === 0) {
    data.forEach((row, rowIndex) => {
      schemaColumns.forEach(column => {
        const value = row[column];
        const def = schema.columns[column];

        if (def.required && (value === null || value === undefined || value === '')) {
          errors.push(
            new ValidationError(`Missing required value for ${column} at row ${rowIndex + 1}`)
          );
        }

        if (value !== null && value !== undefined && value !== '') {
          // Type validation
          const parsed = parseCsvValue(String(value), def.dataType);
          if (typeof parsed !== def.dataType && def.dataType === 'number' && isNaN(parsed)) {
            errors.push(
              new ValidationError(`Invalid number format for ${column} at row ${rowIndex + 1}`)
            );
          }

          // Format validation
          if (def.format && !def.format.test(String(value))) {
            errors.push(
              new ValidationError(`Format mismatch for ${column} at row ${rowIndex + 1}`)
            );
          }

          // Value constraints
          if (typeof def.min === 'number' && Number(value) < def.min) {
            errors.push(
              new ValidationError(`${column} value too low at row ${rowIndex + 1} (min ${def.min})`)
            );
          }
          if (typeof def.max === 'number' && Number(value) > def.max) {
            errors.push(
              new ValidationError(
                `${column} value too high at row ${rowIndex + 1} (max ${def.max})`
              )
            );
          }

          // Allowed values
          if (def.allowedValues && !def.allowedValues.includes(String(value))) {
            errors.push(new ValidationError(`Invalid value for ${column} at row ${rowIndex + 1}`));
          }
        }
      });
    });
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, 'CSV validation failed');
  }
}

export function parseCsvData(
  csvText: string,
  schemaType: keyof typeof csvSchemas
): Record<string, unknown>[] {
  const schema = csvSchemas[schemaType];
  const rows = csvText.split('\n').filter(line => line.trim());
  const headers =
    rows
      .shift()
      ?.split(',')
      .map(h => h.trim()) || [];

  const data = rows.map((row, index) => {
    const values = row.split(',');
    return headers.reduce(
      (obj, header, i) => {
        obj[header] = parseCsvValue(values[i], schema.columns[header]?.dataType);
        return obj;
      },
      {} as Record<string, unknown>
    );
  });

  validateCsvAgainstSchema(data, headers, schema);
  return data;
}
