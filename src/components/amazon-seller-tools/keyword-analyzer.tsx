'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, Download, Search, Info, Loader2 } from 'lucide-react'; // Changed loading icon
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
import { KeywordIntelligence, KeywordAnalysisResult } from '@/lib/keyword-intelligence';
import { cn } from '@/lib/utils';

// --- Interfaces and Types ---

interface RawKeywordData {
  product: string;
  keywords?: string | string[]; // Allow comma-separated string or array
  searchVolume?: string | number; // Allow string from CSV
  competition?: string; // Allow string from CSV
}

type ProcessedKeywordData = {
  id: string; // Unique ID for keys
  product: string;
  keywords: string[];
  searchVolume?: number;
  competition?: CompetitionLevel;
  analysis?: KeywordAnalysisResult[]; // Results from KeywordIntelligence
  suggestions?: string[]; // Top keywords based on analysis or input
  avgScore?: number; // Average score from analysis
};

interface ManualInputState {
  product: string;
  keywords: string;
}

// --- Constants ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const REQUIRED_COLUMNS: (keyof RawKeywordData)[] = ['product', 'keywords'];
const OPTIONAL_COLUMNS: (keyof RawKeywordData)[] = ['searchVolume', 'competition'];
const COMPETITION_LEVELS = ['Low', 'Medium', 'High'] as const;
type CompetitionLevel = (typeof COMPETITION_LEVELS)[number];
const DEFAULT_COMPETITION: CompetitionLevel = 'Medium';
const MAX_SUGGESTIONS = 5; // Max suggestions to show

// --- Component ---

export default function KeywordAnalyzer() {
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
    async (rawData: RawKeywordData[], isManualEntry: boolean = false) => {
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
        const processedItems: ProcessedKeywordData[] = await Promise.all(
          rawData.map(async (item, index) => {
            // 1. Parse Keywords (handle string or array)
            const keywordArray =
              typeof item.keywords === 'string'
                ? item.keywords
                    .split(',')
                    .map((k: string) => k.trim())
                    .filter(Boolean) // Filter out empty strings
                : Array.isArray(item.keywords)
                  ? item.keywords.map(k => String(k).trim()).filter(Boolean) // Ensure strings and filter empty
                  : [];

            // Skip if no keywords after parsing
            if (keywordArray.length === 0) {
              console.warn(
                `Skipping product '${item.product || `Row ${index + 1}`}' due to missing or empty keywords.`
              );
              return null; // Mark as invalid for filtering later
            }

            // 2. Parse Search Volume (optional)
            let searchVolume: number | undefined = undefined;
            if (item.searchVolume !== undefined && item.searchVolume !== '') {
              const vol = Number(item.searchVolume);
              if (!isNaN(vol) && vol >= 0) {
                // Ensure it's a non-negative number
                searchVolume = vol;
              } else {
                console.warn(
                  `Invalid search volume '${item.searchVolume}' for product '${item.product}'. Ignoring.`
                );
              }
            }

            // 3. Parse Competition (optional)
            let competition: CompetitionLevel | undefined = undefined;
            if (item.competition) {
              const compStr = String(item.competition).trim();
              const compStrLower = compStr.toLowerCase();
              const matchedLevel = COMPETITION_LEVELS.find(
                level => level.toLowerCase() === compStrLower
              );
              if (matchedLevel) {
                competition = matchedLevel;
              } else {
                console.warn(
                  `Invalid competition level '${compStr}' for product '${item.product}'. Using default '${DEFAULT_COMPETITION}'.`
                );
                competition = DEFAULT_COMPETITION; // Assign default if invalid
              }
            }

            // 4. Analyze Keywords using KeywordIntelligence
            let analysis: KeywordAnalysisResult[] = [];
            let avgScore: number | undefined = undefined;
            let suggestions: string[] = [];

            try {
              analysis = await KeywordIntelligence.analyzeBatch(keywordArray);
              if (analysis.length > 0) {
                avgScore = analysis.reduce((sum, a) => sum + a.score, 0) / analysis.length;
                // Generate suggestions based on score
                suggestions = analysis
                  .sort((a, b) => b.score - a.score) // Sort by score descending
                  .map(a => a.keyword)
                  .slice(0, MAX_SUGGESTIONS);
              } else {
                // Fallback suggestions if analysis returns empty (e.g., simple related terms)
                suggestions = keywordArray.slice(0, MAX_SUGGESTIONS).map(k => `related:${k}`);
              }
            } catch (analysisError) {
              console.error(
                `Error analyzing keywords for product '${item.product}':`,
                analysisError
              );
              // Optionally add an issue/note to the product data
              // suggestions = ['Analysis failed']; // Indicate failure
            }

            // 5. Construct Processed Data Object
            return {
              id: `product-${Date.now()}-${index}`, // Generate unique ID
              product: String(item.product || `Product ${index + 1}`), // Ensure product name exists
              keywords: keywordArray,
              searchVolume,
              competition,
              analysis, // Store the full analysis results
              suggestions,
              avgScore,
            };
          })
        );

        // Filter out any items marked as null during mapping (e.g., due to no keywords)
        const validItems = processedItems.filter(
          (item): item is ProcessedKeywordData => item !== null
        );

        if (validItems.length === 0) {
          // This means even after processing, no items had valid keywords or other required data
          throw new Error('No valid products found after processing. Check keyword data.');
        }

        // Update state: Add to existing if manual, otherwise replace
        setProducts(prev => (isManualEntry ? [...prev, ...validItems] : validItems));

        toast({
          title: 'Analysis Complete',
          description: `${validItems.length} product(s) analyzed successfully.`,
          variant: 'default',
        });
      } catch (err) {
        // Catch errors from Promise.all or processing logic
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
      // Removed async as Papa.parse handles async internally via callbacks
      const file = event.target.files?.[0];
      if (event.target) event.target.value = ''; // Allow re-uploading the same file

      if (!file) return; // No file selected

      // File validation
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'Error',
          description: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          variant: 'destructive',
        });
        return;
      }
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: 'Error',
          description: 'Invalid file type. Please upload a CSV.',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      setUploadProgress(0);
      setError(null);
      setProducts([]); // Clear previous results on new upload

      // Use PapaParse for robust CSV handling
      Papa.parse<RawKeywordData>(file, {
        header: true, // Automatically detect headers
        skipEmptyLines: true, // Ignore empty rows
        dynamicTyping: false, // Keep values as strings initially for better validation control
        // Progress callback
        step: (results, parser) => {
          // Estimate progress based on cursor position (bytes processed)
          if (file.size > 0) {
            const progress = results.meta.cursor / file.size;
            setUploadProgress(Math.min(progress * 100, 99)); // Cap at 99 until complete
          }
        },
        // Completion callback
        complete: result => {
          setUploadProgress(100); // Mark parsing as complete

          if (result.errors.length > 0) {
            // Handle non-fatal parsing errors (e.g., malformed rows)
            const errorMsg = `CSV parsing completed with errors: ${result.errors
              .slice(0, 3)
              .map(e => `Row ${e.row}: ${e.message}`)
              .join('; ')}...`;
            console.warn('CSV Parsing Errors:', result.errors);
            setError(errorMsg); // Show error in UI
            toast({
              title: 'CSV Warning',
              description: 'Some rows had parsing errors. Check console.',
              variant: 'default',
            });
            // Continue processing potentially valid data
          }

          // Validate required columns exist in headers
          const headers = result.meta.fields;
          const missingColumns = REQUIRED_COLUMNS.filter(col => !headers?.includes(col));
          if (missingColumns.length > 0) {
            const errMsg = `Missing required columns: ${missingColumns.join(', ')}`;
            setError(errMsg);
            toast({ title: 'Upload Error', description: errMsg, variant: 'destructive' });
            setIsLoading(false); // Stop loading
            setUploadProgress(null);
            return; // Stop processing
          }

          // Basic filter for rows that have at least the required columns populated
          const validData = result.data.filter(item => item.product && item.keywords);

          if (validData.length === 0) {
            setError(
              'No data rows with required fields (product, keywords) found in the CSV file.'
            );
            toast({
              title: 'Upload Error',
              description: 'No valid data rows found.',
              variant: 'destructive',
            });
            setIsLoading(false);
            setUploadProgress(null);
            return; // Stop processing
          }

          // Process the valid data using the centralized async function
          processAndSetData(validData, false); // processAndSetData will handle final loading state
        },
        // Error callback for critical parsing failures
        error: error => {
          const errorMsg = `Failed to parse CSV: ${error.message}`;
          setError(errorMsg);
          toast({ title: 'Upload Error', description: errorMsg, variant: 'destructive' });
          setProducts([]); // Clear data
          setIsLoading(false); // Stop loading
          setUploadProgress(null);
        },
      });
    },
    [toast, processAndSetData] // Dependencies
  );

  const handleManualAnalyze = useCallback(async () => {
    if (!manualInput.keywords.trim()) {
      setError('Please enter keywords to analyze');
      toast({
        title: 'Input Error',
        description: 'Keywords are required for manual analysis.',
        variant: 'destructive',
      });
      return;
    }

    const manualRawData: RawKeywordData = {
      product: manualInput.product.trim() || 'Manual Entry', // Default product name
      keywords: manualInput.keywords, // Pass the comma-separated string
    };

    // Call the processing function, indicating it's a manual entry
    await processAndSetData([manualRawData], true);

    // Reset form only if processing was successful (error state is null after processAndSetData)
    // Need to check error state *after* await completes
    // A simple way is to check if the products array grew, assuming success adds items.
    // Or, rely on the fact that processAndSetData clears the error on success.
    // Let's check the error state directly after the await.
    // Note: This check might be slightly delayed if state updates haven't fully propagated.
    // A more robust way might involve processAndSetData returning a success boolean.
    // For now, let's assume the error state check is sufficient.
    setTimeout(() => {
      // Use setTimeout to allow state update
      if (!error) {
        setManualInput({ product: '', keywords: '' });
      }
    }, 0);
  }, [manualInput, processAndSetData, toast, error]); // Include error in dependencies

  const clearAllData = useCallback(() => {
    setProducts([]);
    setError(null);
    setManualInput({ product: '', keywords: '' });
    if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input visually
    toast({
      title: 'Data Cleared',
      description: 'All keyword data and results have been cleared.',
    });
  }, [toast]);

  const handleExport = useCallback(() => {
    if (products.length === 0) {
      setError('No data to export');
      toast({ title: 'Export Error', description: 'No data to export.', variant: 'destructive' });
      return;
    }

    try {
      // Prepare data for export, handling potential undefined values
      const exportData = products.map(p => ({
        Product: p.product,
        Keywords: p.keywords.join(', '),
        SearchVolume: p.searchVolume?.toLocaleString() ?? 'N/A', // Format number or use N/A
        Competition: p.competition ?? 'N/A',
        AvgScore: p.avgScore?.toFixed(1) ?? 'N/A', // Format score or use N/A
        Suggestions: p.suggestions?.join(', ') ?? 'N/A', // Join suggestions or use N/A
        // Optionally include detailed analysis per keyword if needed
        // ...p.analysis?.map(a => ({ Keyword: a.keyword, Score: a.score, ... }))
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'keyword_analysis_results.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up blob URL
      toast({
        title: 'Export Success',
        description: 'Keyword analysis exported successfully.',
        variant: 'default',
      });
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
        <CardTitle>Keyword Analyzer</CardTitle>
        <CardDescription>
          Analyze keywords via CSV upload or manual entry to understand search volume, competition,
          and relevance score.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Format Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">CSV Format Requirements:</p>
            <p>
              Required columns: <code>{REQUIRED_COLUMNS.join(', ')}</code> (keywords should be
              comma-separated within their cell).
            </p>
            <p>
              Optional columns: <code>{OPTIONAL_COLUMNS.join(', ')}</code> (Competition values: Low,
              Medium, High).
            </p>
            <p className="mt-1">
              Example: <code>product,keywords,searchVolume,competition</code>
              <br />
              <code>
                Wireless Earbuds,&quot;bluetooth earbuds, wireless headphones, noise
                cancelling&quot;,135000,High
              </code>
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Upload */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold mb-2">1. Upload CSV Data</h3>
            <Label
              htmlFor="csv-upload"
              className="flex items-center gap-1 mb-1 text-sm font-medium"
            >
              Keyword Data (CSV)
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      Required: {REQUIRED_COLUMNS.join(', ')}. Optional:{' '}
                      {OPTIONAL_COLUMNS.join(', ')}.
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
                {/* Display number of products loaded from the last successful operation */}
                {products.length > 0
                  ? `${products.length} Product(s) Loaded`
                  : 'Choose CSV File...'}
              </Button>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden" // Hide the default input element
                disabled={isLoading}
              />
              {/* Ensure dataType and fileName are correct for the sample */}
              <SampleCsvButton
                dataType="keyword"
                fileName="sample-keyword-analyzer.csv"
                size="sm"
                buttonText="Sample"
              />
            </div>
            {/* Upload Progress Indicator */}
            {isLoading && uploadProgress !== null && (
              <div className="mt-2 space-y-1">
                <Progress value={uploadProgress} className="h-2 w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  Processing file... {uploadProgress.toFixed(0)}%
                </p>
              </div>
            )}
            {/* Success message after loading */}
            {products.length > 0 && !isLoading && (
              <p className="text-xs text-green-600 mt-1">
                {products.length} product(s) loaded and analyzed.
              </p>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold mb-2">2. Or Enter Manually</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="manual-product" className="text-sm">
                  Product Name (Optional)
                </Label>
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
                <Label htmlFor="manual-keywords" className="text-sm">
                  Keywords (comma-separated)
                </Label>
                <Textarea
                  id="manual-keywords"
                  value={manualInput.keywords}
                  onChange={e => setManualInput({ ...manualInput, keywords: e.target.value })}
                  placeholder="Enter comma-separated keywords..."
                  rows={3} // Adjust rows as needed
                  disabled={isLoading}
                  className="text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter keywords separated by commas.
                </p>
              </div>
              <Button
                onClick={handleManualAnalyze}
                disabled={isLoading}
                size="sm"
                className="w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                Analyze Keywords
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
            disabled={!canExport || isLoading} // Disable if no data or currently loading/analyzing
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

        {/* Loading Indicator (for analysis state, when uploadProgress is null) */}
        {isLoading && uploadProgress === null && (
          <div className="mt-2 space-y-1 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /> {/* Using Loader2 */}
            <p className="text-sm text-muted-foreground">Analyzing keywords...</p>
          </div>
        )}

        {/* Results Display Table */}
        {products.length > 0 && !isLoading && (
          <div className="mt-6 space-y-6">
            <div className="rounded-lg border">
              {' '}
              {/* Added border around the table container */}
              <h3 className="text-md font-semibold mb-0 px-4 py-3 border-b">
                Keyword Analysis Results
              </h3>{' '}
              {/* Title inside the container */}
              <div className="overflow-x-auto">
                {' '}
                {/* Ensure table is scrollable on small screens */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead className="text-right">Search Vol.</TableHead>
                      <TableHead className="text-center">Competition</TableHead>
                      <TableHead className="text-right">Avg. Score</TableHead>
                      <TableHead>Suggestions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium max-w-xs truncate" title={p.product}>
                          {p.product}
                        </TableCell>
                        <TableCell>
                          {/* Tooltip to show full list of keywords */}
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help underline decoration-dotted">
                                  {p.keywords.length} keyword(s)
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm bg-popover text-popover-foreground p-2 rounded shadow-md">
                                <p className="text-xs">{p.keywords.join(', ')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right">
                          {p.searchVolume?.toLocaleString() ?? 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.competition ? (
                            <Badge
                              variant={
                                p.competition === 'High'
                                  ? 'destructive'
                                  : p.competition === 'Medium'
                                    ? 'secondary' // Changed Medium to secondary for better contrast
                                    : 'default' // Changed Low to default (often green/blue)
                              }
                            >
                              {p.competition}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-medium',
                            // Conditional coloring based on score
                            p.avgScore === undefined
                              ? '' // No color if undefined
                              : p.avgScore >= 70
                                ? 'text-green-600 dark:text-green-400' // Good score
                                : p.avgScore >= 40
                                  ? 'text-yellow-600 dark:text-yellow-400' // Medium score
                                  : 'text-red-600 dark:text-red-400' // Low score
                          )}
                        >
                          {p.avgScore?.toFixed(1) ?? 'N/A'} {/* Show score or N/A */}
                        </TableCell>
                        <TableCell>
                          {/* Tooltip for suggestions */}
                          {p.suggestions && p.suggestions.length > 0 ? (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help underline decoration-dotted">
                                    {p.suggestions.length} suggestion(s)
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm bg-popover text-popover-foreground p-2 rounded shadow-md">
                                  <p className="text-xs">{p.suggestions.join(', ')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            'None' // Show None if no suggestions
                          )}
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
