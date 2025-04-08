'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Import Select components
import { useToast } from '../ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info, Upload, AlertCircle, TrendingUp, Download, BarChartHorizontalBig } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import Papa from 'papaparse';
import SampleCsvButton from './sample-csv-button';
import { cn } from '@/lib/utils';

// --- Interfaces and Types ---

const COMPETITION_LEVELS = ['Low', 'Medium', 'High'] as const;
type CompetitionLevel = (typeof COMPETITION_LEVELS)[number];
const DEFAULT_COMPETITION: CompetitionLevel = 'Medium';

// Raw data structure expected from CSV
interface RawProductData {
  product: string;
  category: string;
  price: string | number; // Allow string from CSV
  competition: string;
}

// Processed data structure with calculated estimates
type ProcessedProductData = {
  id: string; // Unique ID for keys
  product: string;
  category: string;
  price: number;
  competition: CompetitionLevel;
  estimatedSales: number;
  estimatedRevenue: number;
  confidence: 'Low' | 'Medium' | 'High';
};

// --- Constants ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const REQUIRED_COLUMNS: (keyof RawProductData)[] = [
  'product',
  'category',
  'price',
  'competition',
];

// --- Component ---

export default function SalesEstimator() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProcessedProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualProduct, setManualProduct] = useState({
    product: '',
    category: '',
    price: '',
    competition: DEFAULT_COMPETITION,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear error when data changes
  useEffect(() => {
    if (products.length > 0) {
      setError(null);
    }
  }, [products]);

  // --- Estimation Logic ---
  const estimateSales = useCallback(
    (
      category: string,
      price: number,
      competition: CompetitionLevel
    ): {
      estimatedSales: number;
      estimatedRevenue: number;
      confidence: 'Low' | 'Medium' | 'High';
    } => {
      // Basic placeholder logic - replace with a more sophisticated model if needed
      let baseSales = 100; // Default base sales

      // Adjust base sales by category (simple example)
      const categoryLower = category.toLowerCase();
      if (categoryLower.includes('electronic')) baseSales = 150;
      else if (categoryLower.includes('phone') || categoryLower.includes('accessory')) baseSales = 200;
      else if (categoryLower.includes('home') || categoryLower.includes('kitchen')) baseSales = 120;
      else if (categoryLower.includes('clothing') || categoryLower.includes('apparel')) baseSales = 80;

      // Adjust based on price point
      const priceFactor = price < 20 ? 1.5 : price < 50 ? 1.0 : 0.7;

      // Adjust based on competition
      const competitionFactor = competition === 'Low' ? 1.4 : competition === 'Medium' ? 1.0 : 0.6;

      const estimatedSales = Math.max(5, Math.round(baseSales * priceFactor * competitionFactor)); // Ensure minimum sales
      const estimatedRevenue = estimatedSales * price;

      // Determine confidence level (simple example)
      let confidence: 'Low' | 'Medium' | 'High' = 'Medium';
      if (competition === 'Low' && priceFactor > 1.0) confidence = 'High';
      else if (competition === 'High' && priceFactor < 1.0) confidence = 'Low';
      else if (competition === 'High' || price > 75) confidence = 'Low';

      return { estimatedSales, estimatedRevenue, confidence };
    },
    [] // No dependencies for this simple version
  );

  // --- Data Processing ---
  const processAndSetData = useCallback(
    (rawData: RawProductData[], isManualEntry: boolean = false) => {
      if (!rawData || rawData.length === 0) {
        setError('No valid product data to process.');
        if (!isManualEntry) {
          setProducts([]);
        }
        return;
      }

      setIsLoading(true); // Indicate processing state
      setError(null);

      try {
        const processedItems: ProcessedProductData[] = rawData
          .map((item, index) => {
            const price = Number(item.price);
            const competitionStr = String(item.competition).trim();
            const competition = COMPETITION_LEVELS.includes(competitionStr as CompetitionLevel)
              ? (competitionStr as CompetitionLevel)
              : DEFAULT_COMPETITION; // Default if invalid

            // Basic validation
            if (!item.product || !item.category || isNaN(price) || price <= 0) {
              console.warn(`Skipping invalid data row ${index + 1}:`, item);
              return null; // Skip invalid rows
            }

            const { estimatedSales, estimatedRevenue, confidence } = estimateSales(
              String(item.category),
              price,
              competition
            );

            return {
              id: `product-${Date.now()}-${index}`, // Generate unique ID
              product: String(item.product),
              category: String(item.category),
              price,
              competition,
              estimatedSales,
              estimatedRevenue,
              confidence,
            };
          })
          .filter((item): item is ProcessedProductData => item !== null); // Remove null entries

        if (processedItems.length === 0) {
          throw new Error('No valid products found after processing.');
        }

        // If manual entry, add to existing products, otherwise replace
        setProducts(prev => (isManualEntry ? [...prev, ...processedItems] : processedItems));

        toast({
          title: 'Estimation Complete',
          description: `${processedItems.length} product(s) processed successfully.`,
          variant: 'default',
        });
      } catch (err) {
        const errorMsg = `Failed to process product data: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`;
        setError(errorMsg);
        toast({ title: 'Processing Error', description: errorMsg, variant: 'destructive' });
        if (!isManualEntry) {
          setProducts([]); // Clear data on error if it was a file upload
        }
      } finally {
        setIsLoading(false); // End processing state
        setUploadProgress(null); // Reset progress if it was an upload
      }
    },
    [estimateSales, toast] // Add dependencies
  );

  // --- Event Handlers ---

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

      Papa.parse<RawProductData>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep as strings for initial validation
        step: (results, parser) => {
          // Estimate progress
          if (file.size > 0) {
            const progress = results.meta.cursor / file.size;
            setUploadProgress(Math.min(progress * 100, 99)); // Cap at 99 until complete
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

          // Validate required columns exist
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

          const validData = result.data.filter(
            item => item.product && item.category && item.price && item.competition
          ); // Basic check

          if (validData.length === 0) {
            setError('No data rows with required fields found in the CSV file.');
            toast({
              title: 'Upload Error',
              description: 'No valid data rows found.',
              variant: 'destructive',
            });
            setIsLoading(false);
            setUploadProgress(null);
            return;
          }

          processAndSetData(validData, false); // Process the data
        },
        error: error => {
          const errorMsg = `Failed to parse CSV: ${error.message}`;
          setError(errorMsg);
          toast({ title: 'Upload Error', description: errorMsg, variant: 'destructive' });
          setProducts([]);
          setIsLoading(false);
          setUploadProgress(null);
        },
      });
    },
    [toast, processAndSetData] // Add processAndSetData dependency
  );

  const handleManualEstimate = useCallback(() => {
    setError(null);
    const { product, category, price: priceStr, competition } = manualProduct;

    if (!product.trim() || !category.trim() || !priceStr.trim()) {
      setError('Please fill in Product Name, Category, and Price.');
      toast({
        title: 'Input Error',
        description: 'Product Name, Category, and Price are required.',
        variant: 'destructive',
      });
      return;
    }

    const price = Number.parseFloat(priceStr);

    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid positive price.');
      toast({
        title: 'Input Error',
        description: 'Price must be a valid positive number.',
        variant: 'destructive',
      });
      return;
    }

    const manualRawData: RawProductData = {
      product: product.trim(),
      category: category.trim(),
      price,
      competition,
    };

    processAndSetData([manualRawData], true); // Process as manual entry

    // Reset form only if processing was successful (no error remained)
    // Note: processAndSetData clears error on success
    if (!error) {
        setManualProduct({
          product: '',
          category: '',
          price: '',
          competition: DEFAULT_COMPETITION,
        });
    }
  }, [manualProduct, processAndSetData, toast, error]); // Add dependencies

  const clearAllData = useCallback(() => {
    setProducts([]);
    setError(null);
    setManualProduct({ product: '', category: '', price: '', competition: DEFAULT_COMPETITION });
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Data Cleared', description: 'All sales estimates data has been cleared.' });
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
        Category: p.category,
        Price: p.price.toFixed(2),
        Competition: p.competition,
        EstimatedSales: p.estimatedSales,
        EstimatedRevenue: p.estimatedRevenue.toFixed(2),
        Confidence: p.confidence,
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_estimates.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Export Success', description: 'Sales estimates exported successfully.', variant: 'default' });
    } catch (error) {
      const errorMsg = `Error exporting data: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      setError(errorMsg);
      toast({ title: 'Export Error', description: errorMsg, variant: 'destructive' });
    }
  }, [products, toast]);

  // Calculate summary metrics
  const summary = products.reduce(
    (acc, product) => {
      acc.totalRevenue += product.estimatedRevenue;
      acc.totalSalesUnits += product.estimatedSales;
      acc.productCount += 1;
      // Simple average confidence (could be weighted)
      const confidenceValue = product.confidence === 'High' ? 3 : product.confidence === 'Medium' ? 2 : 1;
      acc.confidenceSum += confidenceValue;
      return acc;
    },
    { totalRevenue: 0, totalSalesUnits: 0, productCount: 0, confidenceSum: 0 }
  );

  const averageConfidenceValue = summary.productCount > 0 ? summary.confidenceSum / summary.productCount : 0;
  const averageConfidenceLabel: 'Low' | 'Medium' | 'High' =
    averageConfidenceValue >= 2.5 ? 'High' : averageConfidenceValue >= 1.5 ? 'Medium' : 'Low';

  const canExport = products.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Estimator</CardTitle>
        <CardDescription>
          Estimate potential monthly sales and revenue based on product category, price, and competition level.
        </CardDescription>
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
              Competition values: <code>Low</code>, <code>Medium</code>, <code>High</code>.
            </p>
            <p className="mt-1">
              Example: <code>product,category,price,competition</code>
              <br />
              <code>Wireless Earbuds,Electronics,39.99,High</code>
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Upload */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold mb-2">1. Upload CSV Data</h3>
            <Label htmlFor="csv-upload" className="flex items-center gap-1 mb-1 text-sm font-medium">
              Product Data (CSV)
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      CSV with columns: {REQUIRED_COLUMNS.join(', ')}.
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
              {/* Update dataType and fileName for SampleCsvButton */}
              <SampleCsvButton dataType="competitor" fileName="sample-sales-estimator.csv" size="sm" buttonText="Sample" />
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
                <Label htmlFor="manual-product" className="text-sm">Product Name</Label>
                <Input
                  id="manual-product"
                  value={manualProduct.product}
                  onChange={e => setManualProduct({ ...manualProduct, product: e.target.value })}
                  placeholder="e.g., Bluetooth Speaker"
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="manual-category" className="text-sm">Category</Label>
                <Input
                  id="manual-category"
                  value={manualProduct.category}
                  onChange={e => setManualProduct({ ...manualProduct, category: e.target.value })}
                  placeholder="e.g., Electronics"
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="manual-price" className="text-sm">Price ($)</Label>
                  <Input
                    id="manual-price"
                    type="number" min="0.01" step="0.01"
                    value={manualProduct.price}
                    onChange={e => setManualProduct({ ...manualProduct, price: e.target.value })}
                    placeholder="0.00"
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-competition" className="text-sm">Competition</Label>
                  <Select
                    value={manualProduct.competition}
                    onValueChange={(value: CompetitionLevel) => setManualProduct({ ...manualProduct, competition: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="manual-competition" className="text-sm">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPETITION_LEVELS.map(level => (
                        <SelectItem key={level} value={level} className="text-sm">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleManualEstimate} disabled={isLoading} size="sm" className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Estimate Sales
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
            disabled={isLoading && uploadProgress !== null} // Disable clear during upload
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
            Export Estimates
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Indicator (for processing state) */}
        {isLoading && uploadProgress === null && (
          <div className="mt-2 space-y-1 text-center">
            <BarChartHorizontalBig className="mx-auto h-6 w-6 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">Estimating sales potential...</p>
          </div>
        )}

        {/* Results Display */}
        {products.length > 0 && !isLoading && (
          <div className="mt-6 space-y-8">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Products</CardDescription>
                        <CardTitle className="text-2xl">{summary.productCount}</CardTitle>
                    </CardHeader>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Est. Revenue</CardDescription>
                        <CardTitle className="text-2xl">${summary.totalRevenue.toFixed(2)}</CardTitle>
                    </CardHeader>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Est. Sales</CardDescription>
                        <CardTitle className="text-2xl">{summary.totalSalesUnits.toLocaleString()} units</CardTitle>
                    </CardHeader>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Avg. Confidence</CardDescription>
                        <CardTitle className="text-2xl">
                            <Badge
                                variant={
                                    averageConfidenceLabel === 'High' ? 'default'
                                    : averageConfidenceLabel === 'Medium' ? 'secondary'
                                    : 'outline'
                                }
                                className="text-lg" // Make badge text larger
                            >
                                {averageConfidenceLabel}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Data Table */}
            <div className="rounded-lg border">
              <h3 className="text-md font-semibold mb-0 px-4 py-3 border-b">Sales Estimates</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Competition</TableHead>
                      <TableHead className="text-right">Est. Sales</TableHead>
                      <TableHead className="text-right">Est. Revenue</TableHead>
                      <TableHead className="text-center">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium max-w-xs truncate" title={product.product}>{product.product}</TableCell>
                        <TableCell className="max-w-xs truncate" title={product.category}>{product.category}</TableCell>
                        <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              product.competition === 'Low' ? 'default'
                              : product.competition === 'Medium' ? 'secondary'
                              : 'destructive'
                            }
                          >
                            {product.competition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {product.estimatedSales.toLocaleString()} units
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${product.estimatedRevenue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              product.confidence === 'High' ? 'default'
                              : product.confidence === 'Medium' ? 'secondary'
                              : 'outline'
                            }
                          >
                            {product.confidence}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-2 text-sm font-medium">Estimation Methodology</h3>
              <p className="text-sm text-muted-foreground">
                These estimates are generated using a simplified model based on category averages, price points, and competition levels provided.
                Actual sales can vary significantly due to factors like listing quality, reviews, advertising effectiveness, seasonality, and specific market dynamics not captured here.
                Use these estimates as a directional guide, not a guarantee. High confidence indicates factors generally favorable for sales within this model.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
