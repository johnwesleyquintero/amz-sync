'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '../../components/ui/button';
import { FileText, Info, AlertCircle } from 'lucide-react';
import SampleCsvButton from './sample-csv-button';
import { Progress } from '../ui/progress';
import { useToast } from '../../hooks/use-toast';

// Define types outside the component
type CsvRow = Record<string, unknown>;

type SampleDataType =
  | 'fba'
  | 'keyword'
  | 'ppc'
  | 'keyword-dedup'
  | 'acos'
  | 'competitor' // Added missing types based on usage in other files
  | 'keyword-trend'; // Added missing types based on usage in other files

type CsvUploaderProps<T extends CsvRow> = {
  onUploadSuccess: (data: CsvRow[]) => void;
  isLoading: boolean;
  onClear: () => void;
  hasData: boolean;
  requiredColumns: string[];
  dataType: SampleDataType; // Use the defined type
  fileName: string;
  // Removed internal component definition
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Define custom error if needed, otherwise remove if not used
class CSVValidationError extends Error {
  errors: string[];
  constructor(message: string, errors: string[]) {
    super(message);
    this.name = 'CSVValidationError';
    this.errors = errors;
  }
  get formattedErrors(): string {
    return this.errors.join(', ');
  }
}

// Define validation function if needed, otherwise remove
const validateCSVSchema = (fields: string[], data: CsvRow[], toolType: string): string[] => {
  try {
    const schema = csvSchemas[toolType as keyof typeof csvSchemas];
    const parsedData = parseCsvData(
      data.map(row => row.join(',')).join('\n'),
      toolType as keyof typeof csvSchemas
    );
    return [];
  } catch (error) {
    if (error instanceof AggregateError) {
      return error.errors.map(e => e.message);
    }
    return ['Invalid CSV format'];
  }
};

// The actual component function
export default function CsvUploader<T extends CsvRow>({
  onUploadSuccess,
  isLoading,
  onClear,
  hasData,
  requiredColumns,
  dataType,
  fileName,
}: CsvUploaderProps<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const { toast } = useToast();

  // Define handleUploadError within the component scope
  const handleUploadError = useCallback(
    (error: unknown) => {
      console.error('Upload Error:', error); // Log the actual error
      let description = 'Unknown error occurred during upload.';
      if (error instanceof CSVValidationError) {
        description = error.formattedErrors;
        setValidationErrors(error.errors); // Update state if needed
      } else if (error instanceof Error) {
        description = error.message;
      }
      toast({
        title: 'Upload Failed',
        description: description,
        variant: 'destructive',
      });
      setParsingError(description); // Show error in UI
      // Reset states if needed
      setIsParsing(false);
      setParsingProgress(0);
    },
    [toast] // toast is the dependency
  );

  // Define validateCSV if used, otherwise remove
  const validateCSV = useCallback((results: Papa.ParseResult<T>) => {
    const errors = validateCSVSchema(results.meta.fields, results.data);
    if (errors.length > 0) {
      setValidationErrors(errors);
      throw new CSVValidationError('Schema validation failed', errors);
    }
  }, []); // Add dependencies if validateCSVSchema uses props/state

  // Define parseCsv (renamed from handleFileParse for clarity)
  const parseCsv = useCallback(
    (file: File) => {
      setIsParsing(true);
      setParsingError(null);
      setValidationErrors([]);
      setParsingProgress(0);

      Papa.parse<T>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim().toLowerCase(), // Keep header cleaning
        // dynamicTyping: true, // Be cautious with dynamicTyping, might cause issues. Consider false.
        dynamicTyping: false, // Safer default
        step: (results, parser) => {
          // Calculate progress based on cursor
          if (file.size > 0) {
            setParsingProgress(Math.floor((results.meta.cursor / file.size) * 100));
          }
        },
        complete: results => {
          setIsParsing(false);
          setParsingProgress(100); // Ensure it reaches 100

          if (results.errors.length > 0) {
            // Handle non-fatal parsing errors
            const errorMessages = results.errors.map(e => `Row ${e.row}: ${e.message}`).slice(0, 5); // Limit messages
            const description = `CSV parsing completed with errors: ${errorMessages.join('; ')}...`;
            console.warn('CSV Parsing Errors:', results.errors);
            setParsingError(description); // Show simplified error
            toast({
              title: 'CSV Warning',
              description: 'Some rows had parsing errors. Check console.',
              variant: 'default', // Use warning, not destructive
            });
            // Continue processing potentially valid data
          }

          // Validate required columns
          const headers = results.meta.fields;
          const missingColumns = requiredColumns.filter(
            col => !headers?.includes(col.toLowerCase()) // Check lowercase
          );
          if (missingColumns.length > 0) {
            const errorMsg = `Missing required columns: ${missingColumns.join(', ')}`;
            handleUploadError(new Error(errorMsg)); // Use handleUploadError
            return;
          }

          // Optional: Add more validation using validateCSV if needed
          // try {
          //   validateCSV(results);
          // } catch (validationError) {
          //   handleUploadError(validationError);
          //   return;
          // }

          if (results.data.length === 0) {
            handleUploadError(new Error('No valid data rows found in the CSV.'));
            return;
          }

          onUploadSuccess(results.data);
          toast({
            title: 'Upload Successful',
            description: `${results.data.length} records processed from ${file.name}`,
            variant: 'default',
          });
        },
        error: (error: Papa.ParseError) => {
          // Handle critical parsing errors
          handleUploadError(error);
        },
      });
    },
    [onUploadSuccess, requiredColumns, toast, handleUploadError] // Added handleUploadError to dependencies
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false); // Ensure dragging state is reset
      if (acceptedFiles.length === 0) {
        // Don't toast if user just cancelled
        return;
      }

      const file = acceptedFiles[0];

      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: 'Invalid File Type',
          description: 'Only CSV files (.csv) are supported.',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File Too Large',
          description: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          variant: 'destructive',
        });
        return;
      }

      if (file.size === 0) {
        toast({
          title: 'Empty File',
          description: 'The selected file is empty.',
          variant: 'destructive',
        });
        return;
      }

      parseCsv(file);
    },
    [parseCsv, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    multiple: false, // Only allow single file upload
    accept: { 'text/csv': ['.csv'] }, // Specify accepted MIME type
  });

  // Determine combined loading state
  const currentIsLoading = isLoading || isParsing;

  return (
    <div className="flex flex-col gap-4">
      {/* CSV Format Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium">CSV Format Requirements:</p>
          <p>
            Required columns:{' '}
            {requiredColumns.map((col, index) => (
              <React.Fragment key={col}>
                <code>{col}</code>
                {index < requiredColumns.length - 1 ? ', ' : ''}
              </React.Fragment>
            ))}
          </p>
          {/* Add example if helpful */}
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-background p-6 text-center transition-colors duration-200 ease-in-out ${
          isDragActive || isDragging
            ? 'border-primary bg-primary/10'
            : 'border-primary/40 hover:bg-primary/5'
        } ${currentIsLoading ? 'cursor-not-allowed opacity-70' : ''}`}
      >
        <input {...getInputProps()} disabled={currentIsLoading} />
        <FileText className="mb-2 h-8 w-8 text-primary/60" />
        <span className="text-sm font-medium text-foreground">
          {isDragActive
            ? 'Drop the CSV file here...'
            : hasData
              ? 'Drop file to replace or click to upload'
              : 'Drag & drop CSV file here, or click to select'}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          Max file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
        </span>

        {/* Progress Bar */}
        {isParsing && (
          <div className="w-full mt-4">
            <Progress value={parsingProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Processing... {parsingProgress}%
            </p>
          </div>
        )}

        {/* Parsing Error Display */}
        {parsingError &&
          !isParsing && ( // Only show error when not actively parsing
            <div className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-100 p-3 text-red-800 dark:bg-red-900/30 dark:text-red-400 mt-4 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{parsingError}</span>
            </div>
          )}

        {/* Sample Button (only if not loading/parsing) */}
        {!currentIsLoading && (
          <SampleCsvButton dataType={dataType} fileName={fileName} className="mt-4" />
        )}
      </div>

      {/* Clear Button */}
      {hasData && !currentIsLoading && (
        <Button variant="outline" onClick={onClear} disabled={currentIsLoading}>
          Clear Data
        </Button>
      )}
    </div>
  );
}
