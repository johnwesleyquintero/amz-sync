'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { FileText, Info, AlertCircle } from 'lucide-react';
import SampleCsvButton from './sample-csv-button';
import { Progress } from '../ui/progress';
import { useToast } from '@/hooks/use-toast';

type CsvUploaderProps<T> = {
  onUploadSuccess: (data: T[]) => void;
  isLoading: boolean;
  onClear: () => void;
  hasData: boolean;
  requiredColumns: string[];
  dataType: 'fba' | 'keyword' | 'ppc' | 'keyword-dedup' | 'acos';
  fileName: string;
};

interface CsvRow {
  date: string;
  [keyword: string]: string;
  id?: string;
  impressions?: string;
  clicks?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CsvUploader<T extends CsvRow>({
  onUploadSuccess,
  isLoading,
  onClear,
  hasData,
  requiredColumns,
  dataType,
  fileName,
}: CsvUploaderProps<T>) {
  const CsvUploader: React.FC<CsvUploaderProps> = ({ onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [parsingProgress, setParsingProgress] = useState(0);

    const { toast } = useToast();
    const validateCSV = (results: Papa.ParseResult<unknown>) => {
      const errors = validateCSVSchema(results.meta.fields, results.data);
      if (errors.length > 0) {
        setValidationErrors(errors);
        throw new CSVValidationError('Schema validation failed', errors);
      }
    };

    const handleFileParse = useCallback(
      (file: File) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim().toLowerCase(),
          dynamicTyping: true,
          step: results => {
            setParsingProgress(Math.floor((results.meta.cursor / file.size) * 100));
          },
          complete: results => {
            try {
              validateCSV(results);
              onUploadComplete(results.data);
              setValidationErrors([]);
              toast({
                title: 'Upload successful',
                description: `${results.data.length} records processed`,
              });
            } catch (error) {
              handleUploadError(error);
            }
          },
          error: (error: Papa.ParseError) => {
            handleUploadError(error);
          },
        });
      },
      [onUploadComplete, toast]
    );

    const handleUploadError = (error: unknown) => {
      if (error instanceof CSVValidationError) {
        toast({
          title: 'Validation Failed',
          description: error.formattedErrors,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: (error as Error).message || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
      setValidationErrors([]);
    };

    const [parsingError, setParsingError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);

    const parseCsv = useCallback(
      (file: File) => {
        setIsParsing(true);
        setParsingError(null);

        Papa.parse<T>(file, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            setIsParsing(false);
            if (results.errors.length > 0) {
              setParsingError(
                `CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`
              );
              toast({
                title: 'Error',
                description: `CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`,
                variant: 'destructive',
              });
              return;
            }

            const missingColumns = requiredColumns.filter(
              col => !results.meta.fields.includes(col)
            );
            if (missingColumns.length > 0) {
              setParsingError(`Missing required columns: ${missingColumns.join(', ')}`);
              toast({
                title: 'Error',
                description: `Missing required columns: ${missingColumns.join(', ')}`,
                variant: 'destructive',
              });
              return;
            }

            onUploadSuccess(results.data);
            toast({
              title: 'Success',
              description: `${file.name} processed successfully`,
              variant: 'default',
            });
          },
          error: error => {
            setIsParsing(false);
            setParsingError(`Error parsing CSV: ${error.message}`);
            toast({
              title: 'Error',
              description: `Error parsing CSV: ${error.message}`,
              variant: 'destructive',
            });
          },
        });
      },
      [onUploadSuccess, requiredColumns, toast, handleUploadError]
    );

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) {
          toast({
            title: 'Error',
            description: 'No file selected',
            variant: 'destructive',
          });
          return;
        }

        const file = acceptedFiles[0];

        if (!file.name.endsWith('.csv')) {
          toast({
            title: 'Error',
            description: 'Only CSV files are supported',
            variant: 'destructive',
          });
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: 'Error',
            description: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            variant: 'destructive',
          });
          return;
        }

        if (file.size === 0) {
          toast({
            title: 'Error',
            description: 'The file is empty',
            variant: 'destructive',
          });
          return;
        }

        parseCsv(file);
      },
      [parseCsv, toast]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
      <div className="flex flex-col gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">CSV Format Requirements:</p>
            <p>
              Required columns:{' '}
              {requiredColumns.map((col, index) => (
                <code key={index}>{col}</code>
              ))}
            </p>
          </div>
        </div>

        <div
          {...getRootProps()}
          className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-background p-6 text-center hover:bg-primary/5"
        >
          <FileText className="mb-2 h-8 w-8 text-primary/60" />
          <span className="text-sm font-medium">Click to upload CSV</span>
          <input {...getInputProps()} disabled={isLoading || isParsing} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
          )}
          {(isLoading || isParsing) && (
            <div className="w-full mt-4">
              <Progress value={50} className="h-2" />
            </div>
          )}
          {parsingError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-100 p-3 text-red-800 dark:bg-red-900/30 dark:text-red-400 mt-4">
              <AlertCircle className="h-5 w-5" />
              <span>{parsingError}</span>
            </div>
          )}
          <SampleCsvButton dataType={dataType} fileName={fileName} className="mt-4" />
        </div>
        {hasData && (
          <Button variant="outline" onClick={onClear}>
            Clear Data
          </Button>
        )}
      </div>
    );
  };
}
