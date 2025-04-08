'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, Download, Search, Info, BarChartHorizontalBig } from 'lucide-react';
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
  keywords?: string | string[];
  searchVolume?: string | number;
  competition?: string;
}

type ProcessedKeywordData = {
  id: string;
  product: string;
  keywords: string[];
  searchVolume?: number;
  competition?: CompetitionLevel;
  analysis?: KeywordAnalysisResult[];
  suggestions?: string[];
  avgScore?: number;
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
const MAX_SUGGESTIONS = 5;

// --- Component ---

export default function KeywordAnalyzer() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProcessedKeywordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<ManualInputState>({ product: '', keywords: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear error when products change
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
          setProducts([]);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const processedItems: ProcessedKeywordData[] = await Promise.all(
          rawData.map(async (item, index) => {
            const keywordArray =
              typeof item.keywords === 'string'
                ? item.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
                : Array.isArray(item.keywords)
                  ? item.keywords.filter(Boolean)
                  : [];

            let searchVolume: number | undefined = undefined;
            if (item.searchVolume !== undefined && item.searchVolume !== '') {
              const vol = Number(item.searchVolume);
              if (!isNaN(vol)) searchVolume = vol;
            }

            let competition: CompetitionLevel | undefined = undefined;
            if (item.competition) {
              const compStr = String(item.competition).trim();
              if (COMPETITION_LEVELS.includes(compStr as CompetitionLevel)) {
                competition = compStr as CompetitionLevel;
              } else {
                console.warn(`Invalid competition level '${compStr}' for product '${item.product}'. Using default.`);
                competition = DEFAULT_COMPETITION;
              }
            }

            const analysis = await KeywordIntelligence.analyzeBatch(keywordArray);
            const avgScore = analysis.length > 0
              ? analysis.reduce((sum, a) => sum + a.score, 0) / analysis.length
              : undefined;

            const suggestions = analysis.length > 0
              ? analysis.sort((a, b) => b.score - a.score).map(a => a.keyword).slice(0, MAX_SUGGESTIONS)
              : keywordArray.slice(0, MAX_SUGGESTIONS).map(k => `related ${k}`);

            return {
              id: `product-${Date.now()}-${index}`,
              product: String(item.product || `Product ${index + 1}`),
              keywords: keywordArray,
              searchVolume,
              competition,
              analysis,
              suggestions,
              avgScore,
            };
          })
        );

        const validItems = processedItems.filter(p => p.keywords.length > 0);

        if (validItems.length === 0) {
          throw new Error('No valid products found after processing.');
        }

        setProducts(prev => isManualEntry ? [...prev, ...validItems] : validItems);

        toast({
          title: 'Analysis Complete',
          description: `${validItems.length} product(s) analyzed successfully.`,
          variant: 'default',
        });

      } catch (err) {
        const errorMsg = `Failed to process keyword data: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMsg);
        toast({ title: 'Processing Error', description: errorMsg, variant: 'destructive' });
        if (!isManualEntry) {
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
        setUploadProgress(null);
      }
    },
    [toast]
  );

  // --- Event Handlers ---

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (event.target) event.target.value = '';

      if (!file) return;

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
      setProducts([]);

      Papa.parse<RawKeywordData>(file, {
        header: true,
        skipEmptyLines: true,
        step: (results, parser) => {
          if (file.size > 0) {
            const progress = results.meta.cursor / file.size;
            setUploadProgress(progress * 100);
          }
        },
        complete: async (result) => {
          setUploadProgress(100);

          if (result.errors.length > 0) {
            const errorMsg = `CSV parsing completed with errors: ${result.errors.slice(0, 3).map(e => `Row ${e.row}: ${e.message}`).join('; ')}...`;
            console.warn('CSV Parsing Errors:', result.errors);
            setError(errorMsg);
            toast({ title: 'CSV Warning', description: 'Some rows had parsing errors. Check console.', variant: 'default' });
          }

          const validData = result.data.filter(item => item.product && item.keywords);

          if (validData.length === 0) {
            setError('No valid data rows found in the CSV file.');
            toast({ title: 'Upload Error', description: 'No valid data rows found.', variant: 'destructive' });
            setIsLoading(false);
            setUploadProgress(null);
            return;
          }

          await processAndSetData(validData, false);

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
    [toast, processAndSetData]
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
      product: manualInput.product.trim() || 'Manual Entry',
      keywords: manualInput.keywords,
    };

    await processAndSetData([manualRawData], true);

    if (!error) {
      setManualInput({ product: '', keywords: '' });
    }
  }, [manualInput, processAndSetData, toast, error]);

  const clearAllData = useCallback(() => {
    setProducts([]);
    setError(null);
    setManualInput({ product: '', keywords: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Data Cleared', description: 'All keyword data and results have been cleared.' });
  }, [toast]);

  const handleExport = useCallback(() => {
    if (products.length === 0) {
      setError('No data to export');
      toast({ title: 'Export Error', description: 'No data to export.', variant: 'destructive' });
      return;
    }

    try {
      const exportData = products.map(p => ({
        Product: p.product,
        Keywords: p.keywords.join(', '),
        SearchVolume: p.searchVolume ?? 'N/A',
        Competition: p.competition ?? 'N/A',
        AvgScore: p.avgScore?.toFixed(1) ?? 'N/A',
        Suggestions: p.suggestions?.join(', ') ?? 'N/A',
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
      URL.revokeObjectURL(url);
      toast({ title: 'Export Success', description: 'Keyword analysis exported successfully.', variant: 'default' });
    } catch (error) {
      const errorMsg = `Error exporting data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMsg);
      toast({ title: 'Export Error', description: errorMsg, variant: 'destructive' });
    }
  }, [products, toast]);

  const canExport = products.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Analyzer</CardTitle>
        <CardDescription>
          Analyze keywords via CSV upload or manual entry to understand search volume, competition, and relevance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Format Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">CSV Format Requirements:</p>
            <p>
              Required columns: <code>{REQUIRED_COLUMNS.join(', ')}</code> (keywords comma-separated).
            </p>
            <p>
              Optional columns: <code>{OPTIONAL_COLUMNS.join(', ')}</code> (Competition: Low, Medium, High).
            </p>
            <p className="mt-1">
              Example: <code>product,keywords,searchVolume,competition</code>
              <br />
              <code>
                Wireless Earbuds,&quot;bluetooth earbuds, wireless headphones&quot;,135000,High
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
                      Required: {REQUIRED_COLUMNS.join(', ')}. Optional: {OPTIONAL_COLUMNS.join(', ')}.
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
              <SampleCsvButton dataType="keyword" fileName="sample-keyword-analyzer.csv" size="sm" buttonText="Sample" />
            </div>
            {isLoading && uploadProgress !== null && (
              <div className="mt-2 space-y-1">
                <Progress value={uploadProgress} className="h-2 w-full" />
                <p className="text-xs text-muted-foreground text-center">Processing file... {uploadProgress.toFixed(0)}%</p>
              </div>
            )}
            {products.length > 0 && !isLoading && <p className="text-xs text-green-600 mt-1">{products.length} product(s) loaded from file.</p>}
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
                  Enter keywords separated by commas.
                </p>
              </div>
              <Button onClick={handleManualAnalyze} disabled={isLoading} size="sm" className="w-full">
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
            disabled={isLoading && uploadProgress !== null}
          >
            Clear All Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!canExport || isLoading}
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

        {/* Loading Indicator (for analysis state) */}
        {isLoading && uploadProgress === null && (
          <div className="mt-2 space-y-1 text-center">
            <BarChartHorizontalBig className="mx-auto h-6 w-6 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing keywords...</p>
          </div>
        )}

        {/* Results Display */}
        {products.length > 0 && !isLoading && (
          <div className="mt-6 space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="text-md font-semibold mb-4">Keyword Analysis Results</h3>
              <div className="overflow-x-auto">
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
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium max-w-xs truncate" title={p.product}>{p.product}</TableCell>
                        <TableCell>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help underline decoration-dotted">
                                  {p.keywords.length} keyword(s)
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
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
                                p.competition === 'High' ? 'destructive'
                                  : p.competition === 'Medium' ? 'default'
                                    : 'secondary'
                              }
                            >
                              {p.competition}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          p.avgScore === undefined ? '' :
                            p.avgScore >= 70 ? 'text-green-600' :
                              p.avgScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                        )}>
                          {p.avgScore?.toFixed(1) ?? 'N/A'}
                        </TableCell>
                        <TableCell>
                          {p.suggestions && p.suggestions.length > 0 ? (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help underline decoration-dotted">
                                    {p.suggestions.length} suggestion(s)
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <p className="text-xs">{p.suggestions.join(', ')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            'None'
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
