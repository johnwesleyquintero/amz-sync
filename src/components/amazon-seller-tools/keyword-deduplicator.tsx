'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Use Input component
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, Download, Filter, Info, Loader2 } from 'lucide-react'; // Added Loader2
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Papa from 'papaparse';
import SampleCsvButton from './sample-csv-button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label'; // Import Label

// --- Interfaces and Types ---

interface RawKeywordInput {
  product: string;
  keywords?: string | string[]; // Allow comma-separated string or array from CSV/manual
}

interface ProcessedKeywordData {
  id: string; // Unique ID for keys
  product: string;
  originalKeywords: string[];
  cleanedKeywords: string[];
  duplicatesRemoved: number;
  originalCount: number;
  cleanedCount: number;
}

interface ManualInputState {
  product: string;
  keywords: string;
}

// --- Constants ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const REQUIRED_COLUMNS: (keyof RawKeywordInput)[] = ['product', 'keywords'];

// --- Component ---

export default function KeywordDeduplicator() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProcessedKeywordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<ManualInputState>({ product: '', keywords: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear error when products change (indicating successful processing)
  useEffect(() => {
    if (products.length > 0) {
      setError(null);
    }
  }, [products]);

  // --- Data Processing Logic ---
  const processAndSetData = useCallback(
    (rawData: RawKeywordInput[], isManualEntry: boolean = false) => {
      if (!rawData || rawData.length === 0) {
        setError('No valid keyword data to process.');
        if (!isManualEntry) {
          setProducts([]); // Clear previous results if upload yielded no data
        }
        setIsLoading(false); // Ensure loading stops
        return;
      }

      setIsLoading(true);
      setError(null); // Clear previous errors before processing

      try {
        const processedItems: ProcessedKeywordData[] = rawData
          .map((item, index) => {
            // 1. Parse Keywords (handle string or array)
            const originalKeywordsRaw =
              typeof item.keywords === 'string'
                ? item.keywords.split(',').map((k: string) => k.trim())
                : Array.isArray(item.keywords)
                  ? item.keywords.map(k => String(k).trim())
                  : [];

            // Filter out empty strings *after* trimming
            const originalKeywords = originalKeywordsRaw.filter(Boolean);

            // Skip if no keywords after parsing and filtering
            if (originalKeywords.length === 0) {
                console.warn(`Skipping product '${item.product || `Row ${index + 1}`}' due to missing or empty keywords.`);
                return null; // Mark as invalid for filtering later
            }

            // 2. Deduplicate Keywords
            // Use Set for efficient deduplication, preserving order is less critical here
            const cleanedKeywords = [...new Set(originalKeywords)];

            // 3. Calculate Counts
            const originalCount = originalKeywords.length;
            const cleanedCount = cleanedKeywords.length;
            const duplicatesRemoved = originalCount - cleanedCount;

            // 4. Construct Processed Data Object
            return {
              id: `dedup-${Date.now()}-${index}`, // Generate unique ID
              product: String(item.product || `Product ${index + 1}`), // Ensure product name exists
              originalKeywords,
              cleanedKeywords,
              duplicatesRemoved,
              originalCount,
              cleanedCount,
            };
          })
          .filter((item): item is ProcessedKeywordData => item !== null); // Filter out nulls

        if (processedItems.length === 0) {
          // This means even after processing, no items had valid keywords
          throw new Error('No valid products found after processing. Check keyword data.');
        }

        // Update state: Add to existing if manual, otherwise replace
        setProducts(prev => isManualEntry ? [...prev, ...processedItems] : processedItems);

        toast({
          title: 'Deduplication Complete',
          description: `${processedItems.length} product(s) processed successfully.`,
          variant: 'default',
        });

      } catch (err) {
        // Catch errors from processing logic
        const errorMsg = `Failed to process keyword data: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMsg);
        toast({ title: 'Processing Error', description: errorMsg, variant: 'destructive' });
        if (!isManualEntry) {
          setProducts([]); // Clear data on error if it was a file upload
        }
      } finally {
        // Ensure loading state is always reset
        setIsLoading(false);
        setUploadProgress(null); // Reset progress if it was an upload
      }
    },
    [toast] // Dependency: toast function
  );

  // --- Event Handlers ---

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (event.target) event.target.value = ''; // Allow re-uploading the same file

      if (!file) return; // No file selected

      // File validation
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: 'Error', description: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB`, variant: 'destructive' });
        return;
      }
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({ title: 'Error', description: 'Invalid file type. Please upload a CSV.', variant: 'destructive' });
        return;
      }

      setIsLoading(true);
      setUploadProgress(0);
      setError(null);
      setProducts([]); // Clear previous results on new upload

      // Use PapaParse for robust CSV handling
      Papa.parse<RawKeywordInput>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep values as strings initially
        step: (results, parser) => {
          if (file.size > 0) {
            const progress = results.meta.cursor / file.size;
            setUploadProgress(Math.min(progress * 100, 99));
          }
        },
        complete: (result) => {
          setUploadProgress(100);

          if (result.errors.length > 0) {
            const errorMsg = `CSV parsing completed with errors: ${result.errors.slice(0, 3).map(e => `Row ${e.row}: ${e.message}`).join('; ')}...`;
            console.warn('CSV Parsing Errors:', result.errors);
            setError(errorMsg);
            toast({ title: 'CSV Warning', description: 'Some rows had parsing errors. Check console.', variant: 'default' });
          }

          // Validate required columns
          const headers = result.meta.fields;
          const missingColumns = REQUIRED_COLUMNS.filter(col => !headers?.includes(col));
          if (missingColumns.length > 0) {
            const errMsg = `Missing required columns: ${missingColumns.join(', ')}`;
            setError(errMsg);
            toast({ title: 'Upload Error', description: errMsg, variant: 'destructive' });
            setIsLoading(false);
            setUploadProgress(null);
            return;
          }

          // Basic filter for rows that have the required columns populated
          const validData = result.data.filter(item => item.product && item.keywords);

          if (validData.length === 0) {
            setError('No data rows with required fields (product, keywords) found in the CSV file.');
            toast({ title: 'Upload Error', description: 'No valid data rows found.', variant: 'destructive' });
            setIsLoading(false);
            setUploadProgress(null);
            return;
          }

          // Process the valid data using the centralized function
          processAndSetData(validData, false); // processAndSetData will handle final loading state
        },
        error: (error) => {
          const errorMsg = `Failed to parse CSV: ${error.message}`;
          setError(errorMsg);
          toast({ title: 'Upload Error', description: errorMsg, variant: 'destructive' });
          setProducts([]);
          setIsLoading(false);
          setUploadProgress(null);
        },
      });
    },
    [toast, processAndSetData] // Dependencies
  );

  const handleManualProcess = useCallback(() => {
    if (!manualInput.keywords.trim()) {
      setError('Please enter keywords to process');
      toast({
        title: 'Input Error',
        description: 'Keywords are required for manual processing.',
        variant: 'destructive',
      });
      return;
    }

    const manualRawData: RawKeywordInput = {
      product: manualInput.product.trim() || 'Manual Entry', // Default product name
      keywords: manualInput.keywords, // Pass the comma-separated string
    };

    // Call the processing function, indicating it's a manual entry
    processAndSetData([manualRawData], true);

    // Reset form after processing (check error state after await/promise resolves implicitly)
    // Use a timeout to allow state updates to potentially propagate before checking error
    setTimeout(() => {
        // Check the error state *after* processAndSetData finishes
        // This relies on processAndSetData clearing the error on success.
        // A more robust method might involve processAndSetData returning success/failure.
        if (!error) { // Check the error state variable directly
             setManualInput({ product: '', keywords: '' });
        }
    }, 0);

  }, [manualInput, processAndSetData, toast, error]); // Include error in dependencies

  const clearAllData = useCallback(() => {
    setProducts([]);
    setError(null);
    setManualInput({ product: '', keywords: '' });
    if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input visually
    toast({ title: 'Data Cleared', description: 'All keyword data and results have been cleared.' });
  }, [toast]);

  const handleExport = useCallback(() => {
    if (products.length === 0) {
      setError('No data to export');
      toast({ title: 'Export Error', description: 'No data to export.', variant: 'destructive' });
      return;
    }

    try {
      // Prepare data for export
      const exportData = products.map(p => ({
        Product: p.product,
        OriginalKeywords: p.originalKeywords.join(', '),
        CleanedKeywords: p.cleanedKeywords.join(', '),
        OriginalCount: p.originalCount,
        CleanedCount: p.cleanedCount,
        DuplicatesRemoved: p.duplicatesRemoved,
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'deduplicated_keywords.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up blob URL
      toast({ title: 'Export Success', description: 'Deduplicated keywords exported successfully.', variant: 'default' });
    } catch (exportError) {
      const errorMsg = `Error exporting data: ${exportError instanceof Error ? exportError.message : 'Unknown error'}`;
      setError(errorMsg);
      toast({ title: 'Export Error', description: errorMsg, variant: 'destructive' });
    }
  }, [products, toast]);

  const canExport = products.length > 0;

  // --- JSX ---
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Deduplicator</CardTitle>
        <CardDescription>
          Remove duplicate keywords from your lists via CSV upload or manual entry.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Format Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">CSV Format Requirements:</p>
            <p>
              Required columns: <code>{REQUIRED_COLUMNS.join(', ')}</code> (keywords should be comma-separated within their cell).
            </p>
            <p className="mt-1">
              Example: <code>product,keywords</code>
              <br />
              <code>
                Wireless Earbuds,&quot;bluetooth earbuds, wireless earbuds, earbuds bluetooth, wireless headphones, bluetooth earbuds&quot;
              </code>
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Upload */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold mb-2">1. Upload CSV Data</h3>
            <Label htmlFor="csv-upload" className="flex items-center gap-1 mb-1 text-sm font-medium">
              Keyword Data (CSV)
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      Required: {REQUIRED_COLUMNS.join(', ')}. Keywords comma-separated.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-grow justify-start text-left"
              >
                <Upload className="mr-2 h-4 w-4" />
                {products.length > 0 ? `${products.length} Product(s) Loaded` : 'Choose CSV File...'}
              </Button>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
              <SampleCsvButton dataType="keyword-dedup" fileName="sample-keyword-deduplicator.csv" size="sm" buttonText="Sample" />
            </div>
            {isLoading && uploadProgress !== null && (
              <div className="mt-2 space-y-1">
                <Progress value={uploadProgress} className="h-2 w-full" />
                <p className="text-xs text-muted-foreground text-center">Processing file... {uploadProgress.toFixed(0)}%</p>
              </div>
            )}
            {products.length > 0 && !isLoading && <p className="text-xs text-green-600 mt-1">{products.length} product(s) loaded and processed.</p>}
          </div>

          {/* Manual Input */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold mb-2">2. Or Enter Manually</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="manual-product" className="text-sm">Product Name (Optional)</Label>
                <Input
                  id="manual-product"
                  value={manualInput.product}
                  onChange={e => setManualInput({ ...manualInput, product: e.target.value })}
                  placeholder="e.g., Wireless Earbuds"
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="manual-keywords" className="text-sm">Keywords (comma-separated)</Label>
                <Textarea
                  id="manual-keywords"
                  value={manualInput.keywords}
                  onChange={e => setManualInput({ ...manualInput, keywords: e.target.value })}
                  placeholder="Enter comma-separated keywords..."
                  rows={3}
                  disabled={isLoading}
                  className="text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter keywords separated by commas. Duplicates will be removed.
                </p>
              </div>
              <Button onClick={handleManualProcess} disabled={isLoading} size="sm" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Remove Duplicates
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllData}
            disabled={isLoading && uploadProgress !== null} // Disable clear only during file upload phase
          >
            Clear All Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!canExport || isLoading} // Disable if no data or currently loading/processing
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Indicator (for processing state, when uploadProgress is null) */}
        {isLoading && uploadProgress === null && (
          <div className="mt-2 space-y-1 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processing keywords...</p>
          </div>
        )}

        {/* Results Display Table */}
        {products.length > 0 && !isLoading && (
          <div className="mt-6 space-y-6">
            <div className="rounded-lg border"> {/* Added border around the table container */}
              <h3 className="text-md font-semibold mb-0 px-4 py-3 border-b">Keyword Deduplication Results</h3> {/* Title inside */}
              <div className="overflow-x-auto"> {/* Ensure table is scrollable */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Original Count</TableHead>
                      <TableHead className="text-center">Cleaned Count</TableHead>
                      <TableHead className="text-center">Duplicates Removed</TableHead>
                      <TableHead>Cleaned Keywords</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium max-w-xs truncate" title={p.product}>{p.product}</TableCell>
                        <TableCell className="text-center">{p.originalCount}</TableCell>
                        <TableCell className="text-center">{p.cleanedCount}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={p.duplicatesRemoved > 0 ? 'default' : 'secondary'}>
                            {p.duplicatesRemoved}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {/* Tooltip to show full list of cleaned keywords */}
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help underline decoration-dotted">
                                  {p.cleanedKeywords.length > 3
                                    ? `${p.cleanedKeywords.slice(0, 3).join(', ')}...`
                                    : p.cleanedKeywords.join(', ') || 'None'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md bg-popover text-popover-foreground p-2 rounded shadow-md">
                                <p className="text-xs">{p.cleanedKeywords.join(', ')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
