import React, { useState } from 'react';
import { BatchProcessor, ProcessingProgress } from '@/lib/enhanced-csv-utils';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';

interface CsvProcessorProps {
  onProcessComplete?: (data: CSVData[]) => void;
  validateRow?: (row: CSVData) => boolean;
  batchSize?: number;
}

type CSVData = Record<string, string> & {
  meta?: {
    fields?: string[];
    errors?: Papa.ParseError[];
  };
};

export function CsvProcessor({
  onProcessComplete,
  validateRow,
  batchSize = 1000,
}: CsvProcessorProps) {
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const processor = new BatchProcessor({
        batchSize,
        validateRow,
        cacheResults: true,
      });

      const result = await processor.processFile(file, progress => {
        setProgress(progress);
      });

      if (result.errors.length > 0) {
        setError(`Processed with ${result.errors.length} errors`);
      }

      onProcessComplete?.(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">CSV Processor</h3>
        <Button
          variant="outline"
          disabled={isProcessing}
          onClick={() => document.getElementById('csv-upload')?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload CSV
        </Button>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
      </div>

      {progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Processing rows: {progress.processedRows}</span>
            <span>Batch: {progress.currentBatch}</span>
          </div>
          <Progress
            value={
              progress.totalRows > 0
                ? (progress.processedRows / progress.totalRows) * 100
                : undefined
            }
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Memory usage: {formatBytes(progress.memoryUsage)}</span>
            <span>Errors: {progress.errorCount}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {progress?.status === 'completed' && !error && (
        <div className="flex items-center space-x-2 text-success">
          <CheckCircle className="w-4 h-4" />
          <span>Processing completed successfully</span>
        </div>
      )}
    </Card>
  );
}
