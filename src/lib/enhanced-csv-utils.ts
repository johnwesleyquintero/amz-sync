import Papa from 'papaparse';
import { toast } from '@/hooks/use-toast';
import { CsvSchemaValidator, type CsvSchemaDefinition } from './schema-validation';
import { getSchema, validateSchemaKey, type SchemaKey } from './schema-registry';
import type { CsvParseOptions, CsvExportOptions } from './utils-core';

// Improved type definitions for CSV parsing
export interface ParseResult<T = Record<string, unknown>> {
  data: T[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
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
  validateRow: () => true,
};

export class BatchProcessor<T> {
  private options: BatchProcessingOptions;
  private processedData: T[] = [];
  private errors: ProcessingError[] = [];
  private startTime: number = 0;
  private memoryPeak: number = 0;
  private schemaValidator?: CsvSchemaValidator;

  constructor(options: Partial<BatchProcessingOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    if (options.schema) {
      this.schemaValidator = new CsvSchemaValidator(options.schema);
    } else if (options.schemaKey && validateSchemaKey(options.schemaKey)) {
      this.schemaValidator = new CsvSchemaValidator(getSchema(options.schemaKey));
    }
  }

  private checkMemoryUsage(): number {
    if (typeof window !== 'undefined' && window.performance) {
      const memory = (window.performance as { memory?: { usedJSHeapSize: number } }).memory;
      if (memory) {
        return memory.usedJSHeapSize;
      }
    }
    return 0;
  }

  private async processBatch(
    batch: Record<string, unknown>[],
    currentBatch: number,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<T[]> {
    const processedBatch: T[] = [];
    let retryCount = 0;

    while (retryCount <= (this.options.retryAttempts || 0)) {
      try {
        for (let i = 0; i < batch.length; i++) {
          let row = batch[i];
          if (this.schemaValidator) {
            try {
              const validatedRow = this.schemaValidator.validate([row])[0];
              row = validatedRow; // Use the transformed data
            } catch (error) {
              if (error instanceof AggregateError) {
                error.errors.forEach((e: ValidationError) => {
                  this.errors.push({
                    row: currentBatch * (this.options.batchSize || 1000) + i,
                    error: e.message,
                    data: row,
                  });
                });
              } else {
                this.errors.push({
                  row: currentBatch * (this.options.batchSize || 1000) + i,
                  error: error.message,
                  data: row,
                });
              }
              continue;
            }
          } else if (this.options.validateRow && !this.options.validateRow(row)) {
            this.errors.push({
              row: currentBatch * (this.options.batchSize || 1000) + i,
              error: 'Row validation failed',
              data: row,
            });
            continue;
          }

          processedBatch.push(row as T);
        }
        break;
      } catch (error) {
        retryCount++;
        if (retryCount > (this.options.retryAttempts || 0)) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    const memoryUsage = this.checkMemoryUsage();
    this.memoryPeak = Math.max(this.memoryPeak, memoryUsage);

    if (onProgress) {
      onProgress({
        processedRows: this.processedData.length + processedBatch.length,
        totalRows: -1, // Unknown until complete
        currentBatch,
        errorCount: this.errors.length,
        memoryUsage,
        status: 'processing',
      });
    }

    return processedBatch;
  }

  public async processFile(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<ProcessingResult<T>> {
    this.startTime = Date.now();
    this.processedData = [];
    this.errors = [];
    this.memoryPeak = 0;

    return new Promise((resolve, reject) => {
      let currentBatch = 0;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        chunk: async (results, parser) => {
          try {
            if (this.checkMemoryUsage() > (this.options.memoryThreshold || 0)) {
              parser.pause();
              await new Promise(resolve => setTimeout(resolve, 1000));
              parser.resume();
            }

            const processedBatch = await this.processBatch(results.data, currentBatch, onProgress);
            this.processedData.push(...processedBatch);
            currentBatch++;
          } catch (error) {
            parser.abort();
            reject(error);
          }
        },
        complete: () => {
          const processingTime = Date.now() - this.startTime;

          if (onProgress) {
            onProgress({
              processedRows: this.processedData.length,
              totalRows: this.processedData.length,
              currentBatch,
              errorCount: this.errors.length,
              memoryUsage: this.checkMemoryUsage(),
              status: 'completed',
            });
          }

          resolve({
            data: this.processedData,
            errors: this.errors,
            stats: {
              totalProcessed: this.processedData.length,
              errorCount: this.errors.length,
              processingTime,
              memoryPeak: this.memoryPeak,
            },
          });
        },
        error: error => {
          reject(error);
        },
      });
    });
  }
}
