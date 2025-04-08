// src/components/amazon-seller-tools/listing-quality-checker.tsx
'use client';

/**
 * Listing Quality Checker
 * AI-powered analysis tool to optimize product listings and improve visibility.
 * Analyze and optimize your Amazon product listings for better visibility and conversion.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Import standard Label
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  Download,
  Search,
  Lightbulb,
} from 'lucide-react';
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
import { KeywordIntelligence, KeywordAnalysisResult } from '@/lib/keyword-intelligence';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import SampleCsvButton from './sample-csv-button';
import ToolLabel from '../ui/tool-label'; // Keep for main title

// --- Interfaces and Types ---

interface RawListingData {
  product: string;
  asin?: string; // Added ASIN as optional input
  title?: string;
  description?: string;
  bullet_points?: string; // Semicolon-separated string from CSV
  images?: string | number; // Allow string from CSV
  keywords?: string; // Comma-separated string from CSV
}

interface ListingData {
  id: string; // Unique ID
  product: string;
  asin?: string;
  title?: string;
  description?: string;
  bulletPoints?: string[]; // Processed into array
  images?: number; // Processed into number
  keywords?: string[]; // Processed into array
  keywordAnalysis?: KeywordAnalysisResult[];
  score: number; // Make non-optional
  issues: string[]; // Make non-optional
  suggestions: string[]; // Make non-optional
}

interface ManualInputState {
  asin: string;
}

// --- Constants ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const REQUIRED_COLUMNS: (keyof RawListingData)[] = [
  'product',
  'title',
  'description',
  'bullet_points',
  'images',
  'keywords',
];
const OPTIONAL_COLUMNS: (keyof RawListingData)[] = ['asin'];

const MAX_BULLET_POINTS = 5;
const MIN_BULLET_POINTS = 3; // Added minimum for scoring
const MAX_IMAGES = 7;
const MIN_IMAGES = 5; // Added minimum for scoring
const MIN_KEYWORDS = 5;
const MIN_TITLE_LENGTH = 60;
const MIN_DESCRIPTION_LENGTH = 500;

const DEFAULT_LISTING_SCORE = 100;

// --- Helper Functions ---

const calculateListingScore = (
  listing: Omit<ListingData, 'id' | 'score' | 'issues' | 'suggestions'> & {
    keywordAnalysis?: KeywordAnalysisResult[];
  }
): { score: number; issues: string[]; suggestions: string[] } => {
  let score = DEFAULT_LISTING_SCORE;
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Title Checks
  if (!listing.title) {
    score -= 15;
    issues.push('Title is missing.');
    suggestions.push('Add a compelling title including main keywords.');
  } else if (listing.title.length < MIN_TITLE_LENGTH) {
    score -= 5;
    issues.push(`Title is too short (less than ${MIN_TITLE_LENGTH} chars).`);
    suggestions.push('Expand the title to be more descriptive and include relevant keywords.');
  } else {
    suggestions.push('Consider optimizing title with primary keywords at the beginning.');
  }

  // Description Checks
  if (!listing.description) {
    score -= 15;
    issues.push('Description is missing.');
    suggestions.push('Add a detailed description highlighting features and benefits.');
  } else if (listing.description.length < MIN_DESCRIPTION_LENGTH) {
    score -= 10;
    issues.push(`Description is too short (less than ${MIN_DESCRIPTION_LENGTH} chars).`);
    suggestions.push(
      'Elaborate on product features, benefits, and use cases in the description.'
    );
  } else {
    suggestions.push('Ensure description uses relevant keywords naturally.');
  }

  // Bullet Points Checks
  const numBullets = listing.bulletPoints?.length ?? 0;
  if (numBullets < MIN_BULLET_POINTS) {
    score -= 10;
    issues.push(`Not enough bullet points (less than ${MIN_BULLET_POINTS}).`);
    suggestions.push(`Add at least ${MIN_BULLET_POINTS} bullet points focusing on key benefits.`);
  } else if (numBullets > MAX_BULLET_POINTS) {
    score -= 5; // Penalize slightly for too many
    issues.push(`Too many bullet points (more than ${MAX_BULLET_POINTS}).`);
    suggestions.push(`Condense bullet points to the ${MAX_BULLET_POINTS} most important ones.`);
  } else {
    suggestions.push('Review bullet points for clarity and keyword inclusion.');
  }

  // Image Checks
  const numImages = listing.images ?? 0;
  if (numImages < MIN_IMAGES) {
    score -= 10;
    issues.push(`Not enough images (less than ${MIN_IMAGES}).`);
    suggestions.push(`Add high-quality images/videos, aiming for at least ${MIN_IMAGES}.`);
  } else if (numImages > MAX_IMAGES) {
    // No penalty for more than max, but suggest review
    suggestions.push(`Ensure all ${numImages} images add value and meet Amazon guidelines.`);
  } else {
    suggestions.push('Ensure images are high-resolution and showcase product features.');
  }

  // Keyword Checks
  const numKeywords = listing.keywords?.length ?? 0;
  if (numKeywords < MIN_KEYWORDS) {
    score -= 10;
    issues.push(`Not enough keywords provided (less than ${MIN_KEYWORDS}).`);
    suggestions.push(
      `Include at least ${MIN_KEYWORDS} relevant keywords (consider backend keywords too).`
    );
  }

  // Keyword Analysis Checks (if available)
  if (listing.keywordAnalysis) {
    const prohibitedKeywords = listing.keywordAnalysis.filter(k => k.isProhibited);
    if (prohibitedKeywords.length > 0) {
      score -= prohibitedKeywords.length * 5; // Penalty per prohibited keyword
      issues.push(
        `Contains prohibited keywords: ${prohibitedKeywords.map(k => k.keyword).join(', ')}.`
      );
      suggestions.push('Remove prohibited keywords immediately.');
    }
    // Could add checks for low score keywords, etc.
  }

  // Add a general suggestion if score is low
  if (score < 60 && issues.length > 0) {
    suggestions.push('Address the identified issues to significantly improve listing quality.');
  } else if (score < 80) {
    suggestions.push('Minor improvements can boost your listing score further.');
  } else if (issues.length === 0) {
    issues.push('No major issues found.'); // Add positive feedback if no issues
    suggestions.push('Listing quality appears good. Consider A/B testing minor variations.');
  }

  return { score: Math.max(0, score), issues, suggestions };
};

const getListingQualityBadgeVariant = (score: number): BadgeProps['variant'] => {
  if (score >= 80) return 'default'; // Usually green/blue
  if (score >= 50) return 'secondary'; // Usually gray/yellow
  return 'destructive'; // Usually red
};

interface BadgeProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  className?: string;
}

const ListingDetailCheck = ({
  isPresent,
  label,
  details,
}: {
  isPresent: boolean;
  label: string;
  details?: string;
}) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-1">
        {isPresent ? (
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
        )}
        <span>{isPresent ? 'Present' : 'Missing'}</span>
        {details && <span className="text-muted-foreground">({details})</span>}
      </div>
    </div>
  );
};

// --- Component ---

export default function ListingQualityChecker() {
  const { toast } = useToast();
  const [listings, setListings] = useState<ListingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<ManualInputState>({ asin: '' });
  const [activeListing, setActiveListing] = useState<ListingData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear error when data changes
  useEffect(() => {
    if (listings.length > 0) {
      setError(null);
    }
  }, [listings]);

  // Select first listing when data loads
  useEffect(() => {
    if (listings.length > 0 && !activeListing) {
      setActiveListing(listings[0]);
    } else if (listings.length === 0) {
      setActiveListing(null); // Clear active listing if data is cleared
    }
  }, [listings, activeListing]);

  // --- Data Processing Logic ---
  const processAndSetData = useCallback(
    async (rawData: RawListingData[], isManualEntry: boolean = false) => {
      if (!rawData || rawData.length === 0) {
        setError('No valid listing data to process.');
        if (!isManualEntry) {
          setListings([]); // Clear previous results if upload yielded no data
        }
        setIsLoading(false); // Ensure loading stops
        return;
      }

      setIsLoading(true);
      setError(null); // Clear previous errors before processing

      try {
        const processedItems: ListingData[] = await Promise.all(
          rawData.map(async (row, index) => {
            // 1. Parse Keywords
            const keywords =
              row.keywords
                ?.split(',')
                .map(k => k.trim())
                .filter(Boolean) || [];

            // 2. Parse Bullet Points
            const bulletPoints = row.bullet_points?.split(';').filter(Boolean) || [];

            // 3. Parse Images
            const images = Number(row.images) || 0;

            // 4. Analyze Keywords
            let keywordAnalysis: KeywordAnalysisResult[] = [];
            try {
              if (keywords.length > 0) {
                keywordAnalysis = await KeywordIntelligence.analyzeBatch(keywords);
              }
            } catch (analysisError) {
              console.error(`Keyword analysis failed for ${row.product}:`, analysisError);
              // Optionally add an issue/suggestion about analysis failure
            }

            // 5. Prepare data for scoring
            const listingBaseData = {
              product: String(row.product || `Listing ${index + 1}`),
              asin: row.asin || undefined,
              title: row.title || undefined,
              description: row.description || undefined,
              bulletPoints,
              images,
              keywords,
              keywordAnalysis,
            };

            // 6. Calculate Score, Issues, Suggestions
            const { score, issues, suggestions } = calculateListingScore(listingBaseData);

            // 7. Construct Final Data Object
            return {
              id: `listing-${Date.now()}-${index}`, // Unique ID
              ...listingBaseData,
              score,
              issues,
              suggestions,
            };
          })
        );

        // Update state: Add to existing if manual, otherwise replace
        setListings(prev => (isManualEntry ? [...prev, ...processedItems] : processedItems));

        toast({
          title: 'Analysis Complete',
          description: `${processedItems.length} listing(s) analyzed successfully.`,
          variant: 'default',
        });
      } catch (err) {
        // Catch errors from processing logic
        const errorMsg = `Failed to process listing data: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMsg);
        toast({ title: 'Processing Error', description: errorMsg, variant: 'destructive' });
        if (!isManualEntry) {
          setListings([]); // Clear data on error if it was a file upload
        }
      } finally {
        // Ensure loading state is always reset
        setIsLoading(false);
        setUploadProgress(null); // Reset progress if it was an upload
      }
    },
    [toast]
  );

  // --- Event Handlers ---

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (event.target) event.target.value = ''; // Allow re-upload

      if (!file) return;

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
      setListings([]); // Clear previous results on new upload
      setActiveListing(null);

      // Use PapaParse for robust CSV handling
      Papa.parse<RawListingData>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep values as strings initially
        step: (results, parser) => {
          if (file.size > 0) {
            const progress = results.meta.cursor / file.size;
            setUploadProgress(Math.min(progress * 100, 99));
          }
        },
        complete: result => {
          setUploadProgress(100);

          if (result.errors.length > 0) {
            const errorMsg = `CSV parsing completed with errors: ${result.errors
              .slice(0, 3)
              .map(e => `Row ${e.row}: ${e.message}`)
              .join('; ')}...`;
            console.warn('CSV Parsing Errors:', result.errors);
            setError(errorMsg);
            toast({
              title: 'CSV Warning',
              description: 'Some rows had parsing errors. Check console.',
              variant: 'default',
            });
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

          // Basic filter for rows that have at least a product name
          const validData = result.data.filter(item => item.product);

          if (validData.length === 0) {
            setError('No data rows with a product name found in the CSV file.');
            toast({
              title: 'Upload Error',
              description: 'No valid data rows found.',
              variant: 'destructive',
            });
            setIsLoading(false);
            setUploadProgress(null);
            return;
          }

          // Process the valid data using the centralized function
          processAndSetData(validData, false); // processAndSetData will handle final loading state
        },
        error: error => {
          const errorMsg = `Failed to parse CSV: ${error.message}`;
          setError(errorMsg);
          toast({ title: 'Upload Error', description: errorMsg, variant: 'destructive' });
          setListings([]);
          setActiveListing(null);
          setIsLoading(false);
          setUploadProgress(null);
        },
      });
    },
    [toast, processAndSetData] // Dependencies
  );

  const handleAsinCheck = useCallback(async () => {
    const asin = manualInput.asin.trim().toUpperCase();
    if (!asin) {
      setError('Please enter an ASIN');
      toast({
        title: 'Input Error',
        description: 'Please enter an ASIN',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call for ASIN lookup & data generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate random-ish data for the ASIN
    const randomBool = (threshold = 0.5) => Math.random() > threshold;
    const randomInt = (max: number) => Math.floor(Math.random() * (max + 1));

    const generatedData: RawListingData = {
      product: `Product (ASIN: ${asin})`,
      asin: asin,
      title: randomBool(0.2) ? 'Example Title for ' + asin : '',
      description: randomBool(0.2) ? 'This is a sample description for the product...' : '',
      bullet_points: randomBool(0.3)
        ? ['Feature 1', 'Benefit 2', 'Detail 3'].slice(0, randomInt(5)).join(';')
        : '',
      images: randomInt(9), // 0 to 9 images
      keywords: randomBool(0.3)
        ? ['keyword a', 'keyword b', 'test keyword', 'prohibited example']
            .slice(0, randomInt(10))
            .join(',')
        : '',
    };

    // Process the generated data
    await processAndSetData([generatedData], true); // Process as manual entry

    // Reset input field only if processing was successful (error is null)
    setTimeout(() => {
      if (!error) {
        setManualInput({ asin: '' });
      }
    }, 0);
  }, [manualInput, processAndSetData, toast, error]); // Include error in dependencies

  const clearAllData = useCallback(() => {
    setListings([]);
    setActiveListing(null);
    setError(null);
    setManualInput({ asin: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Data Cleared', description: 'All listing data and results cleared.' });
  }, [toast]);

  const handleExport = useCallback(() => {
    if (listings.length === 0) {
      setError('No data to export');
      toast({ title: 'Export Error', description: 'No data to export.', variant: 'destructive' });
      return;
    }

    try {
      const exportData = listings.map(l => ({
        Product: l.product,
        ASIN: l.asin ?? '',
        Score: l.score,
        Title_Present: l.title ? 'Yes' : 'No',
        Description_Present: l.description ? 'Yes' : 'No',
        Bullet_Points_Count: l.bulletPoints?.length ?? 0,
        Image_Count: l.images ?? 0,
        Keywords_Count: l.keywords?.length ?? 0,
        Issues: l.issues.join('; ') || 'None',
        Suggestions: l.suggestions.join('; ') || 'None',
        // Optionally add keyword analysis details
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'listing_quality_check.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: 'Export Success',
        description: 'Listing quality results exported successfully.',
        variant: 'default',
      });
    } catch (exportError) {
      const errorMsg = `Error exporting data: ${exportError instanceof Error ? exportError.message : 'Unknown error'}`;
      setError(errorMsg);
      toast({ title: 'Export Error', description: errorMsg, variant: 'destructive' });
    }
  }, [listings, toast]);

  const canExport = listings.length > 0;

  // --- JSX ---
  return (
    <Card>
      <CardHeader>
        <ToolLabel
          title="Listing Quality Checker"
          description="AI-powered analysis tool to optimize product listings and improve visibility."
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Format Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">CSV Format Requirements:</p>
            <p>
              Required columns: <code>{REQUIRED_COLUMNS.join(', ')}</code>. Optional:{' '}
              <code>{OPTIONAL_COLUMNS.join(', ')}</code>.
            </p>
            <p>
              <code>bullet_points</code> should be semicolon-separated (;).{' '}
              <code>keywords</code> should be comma-separated (,).
            </p>
            <p className="mt-1">
              Example: <code>product,title,description,bullet_points,images,keywords</code>
              <br />
              <code>
                Wireless Earbuds,&quot;Premium Buds&quot;,&quot;Great sound...&quot;,&quot;Feature
                1;Benefit 2&quot;,7,&quot;earbuds, wireless, bluetooth&quot;
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
              Listing Data (CSV)
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
                {listings.length > 0
                  ? `${listings.length} Listing(s) Loaded`
                  : 'Choose CSV File...'}
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
              <SampleCsvButton
                dataType="competitor" // Needs a specific type for listing data
                fileName="sample-listing-quality.csv"
                size="sm"
                buttonText="Sample"
              />
            </div>
            {isLoading && uploadProgress !== null && (
              <div className="mt-2 space-y-1">
                <Progress value={uploadProgress} className="h-2 w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  Processing file... {uploadProgress.toFixed(0)}%
                </p>
              </div>
            )}
            {listings.length > 0 && !isLoading && (
              <p className="text-xs text-green-600 mt-1">
                {listings.length} listing(s) loaded and analyzed.
              </p>
            )}
          </div>

          {/* Manual ASIN Input */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold mb-2">2. Or Check by ASIN (Simulated)</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="manual-asin" className="text-sm">
                  Amazon ASIN
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-asin"
                    value={manualInput.asin}
                    onChange={e => setManualInput({ ...manualInput, asin: e.target.value })}
                    placeholder="Enter ASIN (e.g., B08N5KWB9H)"
                    disabled={isLoading}
                    className="text-sm"
                  />
                  <Button onClick={handleAsinCheck} disabled={isLoading} size="sm">
                    <Search className="mr-2 h-4 w-4" />
                    Check ASIN
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Note: This simulates data fetching and analysis for the entered ASIN.
                </p>
              </div>
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
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing listing quality...</p>
          </div>
        )}

        {/* Results Display */}
        {listings.length > 0 && !isLoading && (
          <div className="space-y-6">
            {/* Listing Selection Table */}
            <div className="rounded-lg border">
              <h3 className="text-md font-semibold mb-0 px-4 py-3 border-b">Select Listing</h3>
              <div className="overflow-x-auto max-h-60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>ASIN</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map(listing => (
                      <TableRow
                        key={listing.id}
                        className={cn(
                          'cursor-pointer hover:bg-muted/50',
                          activeListing?.id === listing.id && 'bg-muted'
                        )}
                        onClick={() => setActiveListing(listing)}
                      >
                        <TableCell className="font-medium">{listing.product}</TableCell>
                        <TableCell>{listing.asin || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getListingQualityBadgeVariant(listing.score)}>
                            {listing.score}/100
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Active Listing Detail Card */}
            {activeListing && (
              <Card className="border-primary border-2">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle>{activeListing.product}</CardTitle>
                      {activeListing.asin && (
                        <CardDescription>ASIN: {activeListing.asin}</CardDescription>
                      )}
                    </div>
                    <Badge variant={getListingQualityBadgeVariant(activeListing.score)}>
                      Score: {activeListing.score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Checks */}
                    <div className="space-y-3 rounded-lg border p-4">
                      <h4 className="mb-2 text-sm font-medium">Component Checks</h4>
                      <ListingDetailCheck
                        isPresent={!!activeListing.title}
                        label="Title"
                        details={
                          activeListing.title ? `${activeListing.title.length} chars` : undefined
                        }
                      />
                      <ListingDetailCheck
                        isPresent={!!activeListing.description}
                        label="Description"
                        details={
                          activeListing.description
                            ? `${activeListing.description.length} chars`
                            : undefined
                        }
                      />
                      <ListingDetailCheck
                        isPresent={
                          !!activeListing.bulletPoints &&
                          activeListing.bulletPoints.length >= MIN_BULLET_POINTS
                        }
                        label="Bullet Points"
                        details={`${activeListing.bulletPoints?.length ?? 0} / ${MAX_BULLET_POINTS} rec.`}
                      />
                      <ListingDetailCheck
                        isPresent={!!activeListing.images && activeListing.images >= MIN_IMAGES}
                        label="Images"
                        details={`${activeListing.images ?? 0} / ${MAX_IMAGES} rec.`}
                      />
                      <ListingDetailCheck
                        isPresent={
                          !!activeListing.keywords && activeListing.keywords.length >= MIN_KEYWORDS
                        }
                        label="Keywords"
                        details={`${activeListing.keywords?.length ?? 0} provided`}
                      />
                    </div>

                    {/* Right Column: Issues & Suggestions */}
                    <div className="space-y-4">
                      {/* Issues */}
                      <div className="rounded-lg border border-red-200 dark:border-red-800 p-4">
                        <h4 className="mb-2 text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="h-4 w-4" /> Issues Found
                        </h4>
                        {activeListing.issues && activeListing.issues.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-300">
                            {activeListing.issues.map((issue, i) => (
                              <li key={`issue-${i}`}>{issue}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">No major issues detected.</p>
                        )}
                      </div>

                      {/* Suggestions */}
                      <div className="rounded-lg border border-blue-200 dark:border-blue-800 p-4">
                        <h4 className="mb-2 text-sm font-medium flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <Lightbulb className="h-4 w-4" /> Suggestions
                        </h4>
                        {activeListing.suggestions && activeListing.suggestions.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
                            {activeListing.suggestions.map((suggestion, i) => (
                              <li key={`suggestion-${i}`}>{suggestion}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">No specific suggestions.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Keyword Analysis Section (Optional) */}
                  {activeListing.keywordAnalysis && activeListing.keywordAnalysis.length > 0 && (
                    <div className="rounded-lg border p-4 mt-4">
                      <h4 className="mb-2 text-sm font-medium">Keyword Analysis</h4>
                      <div className="overflow-x-auto max-h-40">
                        <Table size="sm">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Keyword</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Prohibited</TableHead>
                              <TableHead>Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activeListing.keywordAnalysis.map((kw, i) => (
                              <TableRow key={`kw-${i}`}>
                                <TableCell>{kw.keyword}</TableCell>
                                <TableCell>{kw.score.toFixed(1)}</TableCell>
                                <TableCell>
                                  {kw.isProhibited ? (
                                    <Badge variant="destructive">Yes</Badge>
                                  ) : (
                                    <Badge variant="secondary">No</Badge>
                                  )}
                                </TableCell>
                                <TableCell>{kw.reason || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
