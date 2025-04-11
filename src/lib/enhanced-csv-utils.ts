import { BatchProcessingOptions, ProcessingProgress, ProcessingError } from './csv-utils';

export class BatchProcessor {
  private options: Required<BatchProcessingOptions>;
  private progress: ProcessingProgress;
  private errors: ProcessingError[];

  constructor(options: BatchProcessingOptions = {}) {
    this.options = {
      batchSize: options.batchSize || 1000,
      memoryThreshold: options.memoryThreshold || 1024 * 1024 * 100, // 100MB
      retryAttempts: options.retryAttempts || 3,
      cacheResults: options.cacheResults ?? true,
      validateRow: options.validateRow || (() => true),
    };

    this.progress = {
      processedRows: 0,
      totalRows: 0,
      currentBatch: 0,
      errorCount: 0,
      memoryUsage: 0,
      status: 'processing',
    };

    this.errors = [];
  }

  async processBatch(data: Record<string, unknown>[]): Promise<ProcessingProgress> {
    try {
      this.progress.totalRows = data.length;
      this.progress.currentBatch++;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        try {
          if (this.options.validateRow(row)) {
            // Process valid row
            this.progress.processedRows++;
          } else {
            this.handleError(i, 'Row validation failed', row);
          }
        } catch (error) {
          this.handleError(i, error instanceof Error ? error.message : 'Unknown error', row);
        }

        // Check memory usage periodically
        if (i % 100 === 0) {
          this.progress.memoryUsage = process.memoryUsage().heapUsed;
          if (this.progress.memoryUsage > this.options.memoryThreshold) {
            throw new Error('Memory threshold exceeded');
          }
        }
      }

      this.progress.status = 'completed';
      return this.progress;
    } catch (error) {
      this.progress.status = 'error';
      throw error;
    }
  }

  private handleError(row: number, error: string, data?: Record<string, unknown>) {
    this.errors.push({ row, error, data });
    this.progress.errorCount++;
  }

  getErrors(): ProcessingError[] {
    return this.errors;
  }

  getProgress(): ProcessingProgress {
    return this.progress;
  }

  reset(): void {
    this.progress = {
      processedRows: 0,
      totalRows: 0,
      currentBatch: 0,
      errorCount: 0,
      memoryUsage: 0,
      status: 'processing',
    };
    this.errors = [];
  }
}
