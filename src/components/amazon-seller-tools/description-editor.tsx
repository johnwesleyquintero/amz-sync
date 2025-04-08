// src/components/amazon-seller-tools/description-editor.tsx
'use client';

/**
 * Description Editor
 * AI-enhanced rich text editor for Amazon product descriptions with SEO optimization.
 * Create and optimize Amazon product descriptions with AI-powered suggestions and SEO tools.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Use standard Label
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  AlertCircle,
  Save,
  Eye,
  Info,
  Loader2,
  Download,
  Edit,
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
import SampleCsvButton from './sample-csv-button';
import ToolLabel from '../ui/tool-label'; // Keep for the main title
import { cn } from '@/lib/utils';

// --- Interfaces and Types ---

interface RawProductData {
  product: string;
  asin?: string;
  description: string;
}

interface ProductDescription {
  id: string; // Unique ID for keys
  product: string;
  asin?: string;
  description: string;
  characterCount: number;
  keywordCount: number;
  score: number; // Make score non-optional, default to 0
}

interface ManualInputState {
  product: string;
  asin: string;
  description: string;
}

// --- Constants ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const REQUIRED_COLUMNS: (keyof RawProductData)[] = ['product', 'description'];
const OPTIONAL_COLUMNS: (keyof RawProductData)[] = ['asin'];

// --- Helper Functions (Keyword Counting & Scoring) ---

// Simple stop words list
const STOP_WORDS = new Set([
  'the',
  'a',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'an',
  'and',
  'but',
  'if',
  'or',
  'because',
  'as',
  'until',
  'while',
  'of',
  'at',
  'by',
  'for',
  'with',
  'about',
  'against',
  'between',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'to',
  'from',
  'up',
  'down',
  'in',
  'out',
  'on',
  'off',
  'over',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'any',
  'both',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'can',
  'will',
  'just',
  'should',
  'now',
]);

// Basic stemming (remove common suffixes)
const stemWord = (word: string): string => {
  word = word.toLowerCase();
  // Order matters: check longer suffixes first
  if (word.endsWith('ing')) {
    word = word.slice(0, -3);
  } else if (word.endsWith('ed')) {
    word = word.slice(0, -2);
  } else if (word.endsWith('s') && !word.endsWith('ss')) {
    // Avoid removing 's' from words like 'business'
    word = word.slice(0, -1);
  }
  return word;
};

const countKeywords = (text: string, targetKeywords: string[]): number => {
  if (!text || targetKeywords.length === 0) return 0;

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const stemmedTextWords = words.filter(word => !STOP_WORDS.has(word)).map(stemWord);
  const stemmedTargetKeywords = targetKeywords.map(stemWord);

  let keywordCount = 0;
  stemmedTargetKeywords.forEach(targetKw => {
    if (!targetKw) return; // Skip empty target keywords
    stemmedTextWords.forEach(textWord => {
      if (textWord === targetKw) {
        keywordCount++;
      }
    });
  });

  return keywordCount;
};

const calculateScore = (text: string, targetKeywords: string[]): number => {
  if (!text) return 0;

  let score = 0;
  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1; // Avoid division by zero
  const syllables = words.reduce(
    (count, word) => count + (word.toLowerCase().match(/[aeiouy]+/g)?.length || 1), // Count at least 1 syllable per word
    0
  );

  // --- Keyword Density Score (0-30 points) ---
  const keywordCount = countKeywords(text, targetKeywords);
  const keywordDensity = wordCount > 0 ? keywordCount / wordCount : 0;
  if (keywordDensity >= 0.015 && keywordDensity <= 0.04) score += 30; // Optimal range
  else if (keywordDensity >= 0.005 && keywordDensity < 0.06) score += 15; // Acceptable range

  // --- Keyword Placement Score (0-20 points) ---
  const firstParagraph = text.split('\n\n')[0] || ''; // Check first paragraph
  let placementScore = 0;
  targetKeywords.forEach(keyword => {
    if (keyword && firstParagraph.toLowerCase().includes(keyword.toLowerCase())) {
      placementScore += 5;
    }
  });
  score += Math.min(placementScore, 20);

  // --- Readability Score (Flesch Reading Ease) (0-30 points) ---
  // Formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  if (wordCount > 0 && sentences > 0) {
    const avgSentenceLength = wordCount / sentences;
    const avgSyllablesPerWord = syllables / wordCount;
    const fleschScore = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;

    if (fleschScore >= 60) score += 30; // Fairly easy to read or better
    else if (fleschScore >= 30) score += 15; // Standard/Difficult
    // else score += 0; // Very difficult
  }

  // --- Length Score (0-20 points) ---
  const charCount = text.length;
  if (charCount >= 1500) score += 20;
  else if (charCount >= 1000) score += 15;
  else if (charCount >= 500) score += 10;

  return Math.max(0, Math.min(100, Math.round(score))); // Ensure score is between 0 and 100
};

// --- Component ---

export default function DescriptionEditor() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductDescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [activeProduct, setActiveProduct] = useState<ProductDescription | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [manualInput, setManualInput] = useState<ManualInputState>({
    product: '',
    asin: '',
    description: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear error when data changes
  useEffect(() => {
    if (products.length > 0 || activeProduct) {
      setError(null);
    }
  }, [products, activeProduct]);

  // Recalculate score for active product when target keywords change
  useEffect(() => {
    if (activeProduct) {
      const updatedProduct = {
        ...activeProduct,
        keywordCount: countKeywords(activeProduct.description, targetKeywords),
        score: calculateScore(activeProduct.description, targetKeywords),
      };
      setActiveProduct(updatedProduct);
      // Update in the main list as well
      setProducts(prev =>
        prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKeywords]); // Only run when targetKeywords change

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (event.target) event.target.value = ''; // Allow re-upload

      if (!file) return;

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
      setProducts([]); // Clear previous data
      setActiveProduct(null);

      Papa.parse<RawProductData>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        step: (results, parser) => {
          if (file.size > 0) {
            const progress = results.meta.cursor / file.size;
            setUploadProgress(Math.min(progress * 100, 99));
          }
        },
        complete: result => {
          setUploadProgress(100);
          setIsLoading(false); // Parsing done, analysis might still happen

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

          const headers = result.meta.fields;
          const missingColumns = REQUIRED_COLUMNS.filter(col => !headers?.includes(col));
          if (missingColumns.length > 0) {
            const errMsg = `Missing required columns: ${missingColumns.join(', ')}`;
            setError(errMsg);
            toast({ title: 'Upload Error', description: errMsg, variant: 'destructive' });
            setUploadProgress(null);
            return;
          }

          const validData = result.data.filter(item => item.product && item.description);

          if (validData.length === 0) {
            setError('No valid data rows found in the CSV file.');
            toast({
              title: 'Upload Error',
              description: 'No valid data rows found.',
              variant: 'destructive',
            });
            setUploadProgress(null);
            return;
          }

          // Process and set data
          const processedData: ProductDescription[] = validData.map((row, index) => {
            const desc = row.description || '';
            const keywords = targetKeywords; // Use current target keywords for initial calc
            return {
              id: `product-${Date.now()}-${index}`,
              product: row.product,
              asin: row.asin || undefined,
              description: desc,
              characterCount: desc.length,
              keywordCount: countKeywords(desc, keywords),
              score: calculateScore(desc, keywords),
            };
          });

          setProducts(processedData);
          if (processedData.length > 0) {
            setActiveProduct(processedData[0]); // Set first product as active
          }
          setError(null);
          toast({
            title: 'CSV Processed',
            description: `Loaded ${processedData.length} product descriptions`,
            variant: 'default',
          });
          setUploadProgress(null);
        },
        error: error => {
          const errorMsg = `Failed to parse CSV: ${error.message}`;
          setError(errorMsg);
          toast({ title: 'Upload Error', description: errorMsg, variant: 'destructive' });
          setIsLoading(false);
          setUploadProgress(null);
        },
      });
    },
    [toast, targetKeywords] // Include targetKeywords dependency
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      if (!activeProduct) return;

      const updatedProduct = {
        ...activeProduct,
        description: value,
        characterCount: value.length,
        keywordCount: countKeywords(value, targetKeywords),
        score: calculateScore(value, targetKeywords),
      };

      setActiveProduct(updatedProduct);

      // Update the product in the main products array immediately
      setProducts(prevProducts =>
        prevProducts.map(p => (p.id === activeProduct.id ? updatedProduct : p))
      );
    },
    [activeProduct, targetKeywords]
  );

  const handleAddProduct = useCallback(() => {
    if (!manualInput.product.trim() || !manualInput.description.trim()) {
      setError('Product Name and Description are required.');
      toast({
        title: 'Input Error',
        description: 'Product Name and Description are required.',
        variant: 'destructive',
      });
      return;
    }

    const desc = manualInput.description;
    const keywords = targetKeywords;
    const newProductData: ProductDescription = {
      id: `product-${Date.now()}-manual`,
      product: manualInput.product.trim(),
      asin: manualInput.asin.trim() || undefined,
      description: desc,
      characterCount: desc.length,
      keywordCount: countKeywords(desc, keywords),
      score: calculateScore(desc, keywords),
    };

    setProducts(prev => [...prev, newProductData]);
    setActiveProduct(newProductData); // Make the newly added product active
    setManualInput({ product: '', asin: '', description: '' }); // Reset form
    setError(null);
    toast({
      title: 'Product Added',
      description: `${newProductData.product} added successfully.`,
      variant: 'default',
    });
  }, [manualInput, targetKeywords, toast]);

  const handleSave = useCallback(() => {
    // In a real app, this would likely save to a backend or local storage.
    // For now, it just confirms the data is in the state.
    if (!activeProduct) return;
    toast({
      title: 'Saved (Locally)',
      description: `Changes for ${activeProduct.product} are updated in the current session.`,
      variant: 'default',
    });
    // The state is already updated by handleDescriptionChange
  }, [activeProduct, toast]);

  const clearAllData = useCallback(() => {
    setProducts([]);
    setActiveProduct(null);
    setError(null);
    setTargetKeywords([]);
    setManualInput({ product: '', asin: '', description: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Data Cleared', description: 'All product descriptions cleared.' });
  }, [toast]);

  const handleExport = useCallback(() => {
    if (products.length === 0) {
      setError('No data to export');
      toast({ title: 'Export Error', description: 'No data to export.', variant: 'destructive' });
      return;
    }

    try {
      const exportData = products.map(p => ({
        product: p.product,
        asin: p.asin ?? '',
        description: p.description,
        characterCount: p.characterCount,
        keywordCount: p.keywordCount,
        score: p.score,
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'product_descriptions_edited.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: 'Export Success',
        description: 'Product descriptions exported successfully.',
        variant: 'default',
      });
    } catch (exportError) {
      const errorMsg = `Error exporting data: ${exportError instanceof Error ? exportError.message : 'Unknown error'}`;
      setError(errorMsg);
      toast({ title: 'Export Error', description: errorMsg, variant: 'destructive' });
    }
  }, [products, toast]);

  const canExport = products.length > 0;

  return (
    <Card>
      <CardHeader>
        <ToolLabel
          title="Description Editor"
          description="AI-enhanced rich text editor for Amazon product descriptions with SEO optimization."
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Format Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">CSV Format Requirements:</p>
            <p>
              Required columns: <code>{REQUIRED_COLUMNS.join(', ')}</code>.
            </p>
            <p>
              Optional columns: <code>{OPTIONAL_COLUMNS.join(', ')}</code>.
            </p>
            <p className="mt-1">
              Example: <code>product,asin,description</code>
              <br />
              <code>
                Wireless Earbuds,B0EXAMPLE,&quot;Experience immersive sound with our latest wireless
                earbuds...&quot;
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
              Product Descriptions (CSV)
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
                className="hidden"
                disabled={isLoading}
              />
              <SampleCsvButton
                dataType="keyword" // Adjust if a specific sample type is needed
                fileName="sample-description-editor.csv"
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
            {products.length > 0 && !isLoading && (
              <p className="text-xs text-green-600 mt-1">
                {products.length} product(s) loaded. Select one below to edit.
              </p>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold mb-2">2. Or Add Manually</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="manual-product" className="text-sm">
                  Product Name
                </Label>
                <Input
                  id="manual-product"
                  value={manualInput.product}
                  onChange={e => setManualInput({ ...manualInput, product: e.target.value })}
                  placeholder="Enter product name"
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="manual-asin" className="text-sm">
                  ASIN (Optional)
                </Label>
                <Input
                  id="manual-asin"
                  value={manualInput.asin}
                  onChange={e => setManualInput({ ...manualInput, asin: e.target.value })}
                  placeholder="Enter Amazon ASIN"
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="manual-description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="manual-description"
                  value={manualInput.description}
                  onChange={e => setManualInput({ ...manualInput, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={3}
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
              <Button onClick={handleAddProduct} disabled={isLoading} size="sm" className="w-full">
                Add Product
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

        {/* Loading Indicator (for general processing) */}
        {isLoading && uploadProgress === null && (
          <div className="mt-2 space-y-1 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processing...</p>
          </div>
        )}

        {/* Editor/Results Section */}
        {products.length > 0 && !isLoading && (
          <div className="space-y-6">
            {/* Product Selection Table */}
            <div className="rounded-lg border">
              <h3 className="text-md font-semibold mb-0 px-4 py-3 border-b">Select Product</h3>
              <div className="overflow-x-auto max-h-60">
                {' '}
                {/* Make table scrollable */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>ASIN</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => (
                      <TableRow
                        key={product.id}
                        className={cn(
                          'cursor-pointer hover:bg-muted/50',
                          activeProduct?.id === product.id && 'bg-muted'
                        )}
                        onClick={() => {
                          setActiveProduct(product);
                          setShowPreview(false); // Default to edit view on select
                        }}
                      >
                        <TableCell className="font-medium">{product.product}</TableCell>
                        <TableCell>{product.asin || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              product.score >= 80
                                ? 'default'
                                : product.score >= 50
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {product.score}/100
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation(); // Prevent row click
                              setActiveProduct(product);
                              setShowPreview(false);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Active Product Editor Card */}
            {activeProduct && (
              <Card className="border-primary border-2">
                {' '}
                {/* Highlight active card */}
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle>{activeProduct.product}</CardTitle>
                      {activeProduct.asin && (
                        <CardDescription>ASIN: {activeProduct.asin}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? (
                          <>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" /> Preview
                          </>
                        )}
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {/* Target Keywords Input */}
                  <div>
                    <Label htmlFor="target-keywords" className="text-sm font-medium">
                      Target Keywords (comma-separated)
                    </Label>
                    <Input
                      id="target-keywords"
                      value={targetKeywords.join(', ')}
                      onChange={e =>
                        setTargetKeywords(
                          e.target.value.split(',').map(keyword => keyword.trim().toLowerCase())
                        )
                      }
                      placeholder="Enter keywords to track and score against"
                      className="text-sm"
                    />
                  </div>

                  {/* Stats Display */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant="secondary">Chars: {activeProduct.characterCount}</Badge>
                    <Badge variant="secondary">Keywords: {activeProduct.keywordCount}</Badge>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={
                              activeProduct.score >= 80
                                ? 'default'
                                : activeProduct.score >= 50
                                  ? 'secondary'
                                  : 'destructive'
                            }
                            className="cursor-help"
                          >
                            Score: {activeProduct.score}/100
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Score based on length, keyword density/placement, and readability.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Editor / Preview Area */}
                  {showPreview ? (
                    <div className="rounded-lg border bg-muted/30 p-4 min-h-[200px]">
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">Preview</h4>
                      {/* Basic HTML rendering - careful with unsanitized input in real apps */}
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{
                          __html: activeProduct.description
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/\n/g, '<br />'),
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="description-editor" className="text-sm font-medium">
                        Edit Description
                      </Label>
                      <Textarea
                        id="description-editor"
                        value={activeProduct.description}
                        onChange={e => handleDescriptionChange(e.target.value)}
                        placeholder="Enter product description..."
                        rows={15} // Increased rows for better editing
                        className="font-mono text-sm" // Monospace for easier char counting/alignment
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Use HTML tags like &lt;b&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt; if needed
                        for Amazon formatting (basic preview available).
                      </p>
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
