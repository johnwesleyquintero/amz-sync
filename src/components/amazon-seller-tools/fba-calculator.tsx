// src/components/amazon-seller-tools/fba-calculator.tsx
'use client';

/**
 * FBA Calculator
 * Calculate FBA fees, profit margins, and ROI for your Amazon FBA products.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, AlertCircle, Download, Info, Percent, BarChartHorizontalBig } from 'lucide-react'; // Added Percent, BarChartHorizontalBig
import Papa from 'papaparse';
import SampleCsvButton from './sample-csv-button';
import { useToast } from '@/hooks/use-toast';
import ToolLabel from '../ui/tool-label'; // Keep for main title
import { cn } from '@/lib/utils';

// --- Interfaces and Types ---

// Raw data structure expected from CSV
interface RawProductData {
  product: string;
  cost: string | number; // Allow string from CSV
  price: string | number; // Allow string from CSV
  fees: string | number; // Allow string from CSV
}

// Processed data structure with calculated metrics
type ProcessedProductData = {
  id: string; // Unique ID for keys
  product: string;
  cost: number;
  price: number;
  fees: number;
  profit: number; // Make non-optional
  roi: number; // Make non-optional
  margin: number; // Make non-optional
};

// --- Constants ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const REQUIRED_COLUMNS: (keyof RawProductData)[] = ['product', 'cost', 'price', 'fees'];

// --- Component ---

export default function FbaCalculator() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProcessedProductData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manualProduct, setManualProduct] = useState<RawProductData>({
    product: '',
    cost: '',
    price: '',
    fees: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear error when data changes
  useEffect(() => {
    if (products.length > 0) {
      setError(null);
    }
  }, [products]);

  // --- Calculation Logic ---
  const calculateMetrics = useCallback(
    (
      cost: number,
      price: number,
      fees: number
    ): { profit: number; roi: number; margin: number } => {
      const profit = price - cost - fees;
      // Handle division by zero for ROI and Margin
      const roi = cost > 0 ? (profit / cost) * 100 : profit > 0 ? Infinity : 0;
      const margin = price > 0 ? (profit / price) * 100 : profit > 0 ? Infinity : 0;

      return {
        profit,
        roi: isFinite(roi) ? parseFloat(roi.toFixed(2)) : roi, // Keep Infinity if applicable
        margin: isFinite(margin) ? parseFloat(margin.toFixed(2)) : margin, // Keep Infinity if applicable
      };
    },
    []
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
            const cost = Number(item.cost);
            const price = Number(item.price);
            const fees = Number(item.fees);

            // Basic validation
            if (
              !item.product ||
              isNaN(cost) ||
              cost <= 0 ||
              isNaN(price) ||
              price <= 0 ||
              isNaN(fees) ||
              fees < 0
            ) {
              console.warn(`Skipping invalid data row ${index + 1}:`, item);
              return null; // Skip invalid rows
            }

            const { profit, roi, margin } = calculateMetrics(cost, price, fees);

            return {
              id: `fba-${Date.now()}-${index}`, // Generate unique ID
              product: String(item.product),
              cost,
              price,
              fees,
              profit,
              roi,
              margin,
            };
          })
          .filter((item): item is ProcessedProductData => item !== null); // Remove null entries

        if (processedItems.length === 0) {
          throw new Error('No valid products found after processing.');
        }

        // If manual entry, add to existing products, otherwise replace
        setProducts(prev => (isManualEntry ? [...prev, ...processedItems] : processedItems));

        toast({
          title: 'Calculation Complete',
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
    [calculateMetrics, toast] // Add dependencies
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

          // Basic check for required fields being present (further validation in processAndSetData)
          const validData = result.data.filter(
            item => item.product && item.cost && item.price && item.fees
          );

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

  const handleManualCalculation = useCallback(() => {
    setError(null);
    const { product, cost: costStr, price: priceStr, fees: feesStr } = manualProduct;

    if (!product.trim() || !costStr || !priceStr || !feesStr) {
      setError('Please fill in all fields.');
      toast({
        title: 'Input Error',
        description: 'Product Name, Cost, Price, and Fees are required.',
        variant: 'destructive',
      });
      return;
    }

    const cost = Number.parseFloat(String(costStr));
    const price = Number.parseFloat(String(priceStr));
    const fees = Number.parseFloat(String(feesStr));

    if (isNaN(cost) || cost <= 0) {
      setError('Product cost must be a valid positive number.');
      toast({
        title: 'Input Error',
        description: 'Cost must be a valid positive number.',
        variant: 'destructive',
      });
      return;
    }
    if (isNaN(price) || price <= 0) {
      setError('Selling price must be a valid positive number.');
      toast({
        title: 'Input Error',
        description: 'Price must be a valid positive number.',
        variant: 'destructive',
      });
      return;
    }
    if (isNaN(fees) || fees < 0) {
      setError('Fees must be a valid non-negative number.');
      toast({
        title: 'Input Error',
        description: 'Fees must be a valid non-negative number.',
        variant: 'destructive',
      });
      return;
    }

    // Optional: Check if price covers cost + fees
    if (price <= cost + fees) {
      toast({
        title: 'Profitability Warning',
        description: 'Selling price does not cover cost and fees, resulting in a loss.',
        variant: 'default', // Use default/warning, not destructive
      });
      // Allow calculation to proceed even if unprofitable
    }

    const manualRawData: RawProductData = {
      product: product.trim(),
      cost,
      price,
      fees,
    };

    processAndSetData([manualRawData], true); // Process as manual entry

    // Reset form only if processing was successful (no error remained)
    // Use setTimeout to allow state update before checking error
    setTimeout(() => {
      if (!error) {
        setManualProduct({ product: '', cost: '', price: '', fees: '' });
      }
    }, 0);
  }, [manualProduct, processAndSetData, toast, error]); // Add dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setManualProduct(prev => ({
      ...prev,
      [name]: value, // Keep as string for input field
    }));
  };

  const handleExport = useCallback(() => {
    if (products.length === 0) {
      setError('No data to export');
      toast({ title: 'Export Error', description: 'No data to export.', variant: 'destructive' });
      return;
    }

    try {
      const exportData = products.map(p => ({
        Product: p.product,
        Cost: p.cost.toFixed(2),
        Price: p.price.toFixed(2),
        Fees: p.fees.toFixed(2),
        Profit: p.profit.toFixed(2),
        ROI_Percent: isFinite(p.roi) ? p.roi.toFixed(2) : 'Infinity',
        Margin_Percent: isFinite(p.margin) ? p.margin.toFixed(2) : 'Infinity',
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fba_calculator_results.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: 'Export Success',
        description: 'FBA calculation results exported successfully.',
        variant: 'default',
      });
    } catch (exportError) {
      const errorMsg = `Error exporting data: ${
        exportError instanceof Error ? exportError.message : 'Unknown error'
      }`;
      setError(errorMsg);
      toast({ title: 'Export Error', description: errorMsg, variant: 'destructive' });
    }
  }, [products, toast]);

  const clearData = useCallback(() => {
    setProducts([]);
    setError(null);
    setManualProduct({ product: '', cost: '', price: '', fees: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({ title: 'Data Cleared', description: 'All FBA data cleared.' });
  }, [toast]);

  const canExport = products.length > 0;

  // --- JSX ---
  return (
    <Card>
      <CardHeader>
        {/* Use ToolLabel consistent with other tools */}
        <ToolLabel
          title="FBA Calculator"
          description="Calculate FBA fees, profit margins, and ROI for your Amazon FBA products."
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
            <p className="mt-1">
              Example: <code>product,cost,price,fees</code>
              <br />
              <code>Wireless Earbuds,22.50,49.99,7.25</code>
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
              Product Data (CSV)
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
                dataType="fba" // Ensure this dataType exists in generate-sample-csv
                fileName="sample-fba-calculator.csv"
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
                {products.length} product(s) loaded from file.
              </p>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold mb-2">2. Or Enter Manually</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="manual-product" className="text-sm">
                  Product Name
                </Label>
                <Input
                  id="manual-product"
                  name="product"
                  value={manualProduct.product}
                  onChange={handleInputChange}
                  placeholder="e.g., Bluetooth Speaker"
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {' '}
                {/* Adjusted grid for 3 columns */}
                <div>
                  <Label htmlFor="manual-cost" className="text-sm">
                    Cost ($)
                  </Label>
                  <Input
                    id="manual-cost"
                    name="cost"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={manualProduct.cost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-price" className="text-sm">
                    Price ($)
                  </Label>
                  <Input
                    id="manual-price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={manualProduct.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-fees" className="text-sm">
                    Fees ($)
                  </Label>
                  <Input
                    id="manual-fees"
                    name="fees"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualProduct.fees}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>
              </div>
              <Button
                onClick={handleManualCalculation}
                disabled={isLoading}
                size="sm"
                className="w-full"
              >
                <Percent className="mr-2 h-4 w-4" />
                Calculate & Add
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={clearData}
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

        {/* Loading Indicator (for processing state) */}
        {isLoading && uploadProgress === null && (
          <div className="mt-2 space-y-1 text-center">
            <BarChartHorizontalBig className="mx-auto h-6 w-6 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">Calculating metrics...</p>
          </div>
        )}

        {/* Results Display */}
        {products.length > 0 && !isLoading && (
          <div className="mt-6 space-y-6">
            <div className="rounded-lg border">
              <h3 className="text-md font-semibold mb-0 px-4 py-3 border-b">
                FBA Calculation Results
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Cost ($)</TableHead>
                      <TableHead className="text-right">Price ($)</TableHead>
                      <TableHead className="text-right">Fees ($)</TableHead>
                      <TableHead className="text-right">Profit ($)</TableHead>
                      <TableHead className="text-right">ROI (%)</TableHead>
                      <TableHead className="text-right">Margin (%)</TableHead>
                      <TableHead className="w-[100px]">Profitability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-xs truncate" title={item.product}>
                          {item.product}
                        </TableCell>
                        <TableCell className="text-right">{item.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.fees.toFixed(2)}</TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-semibold',
                            item.profit < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          )}
                        >
                          {item.profit.toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right',
                            item.roi < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          )}
                        >
                          {isFinite(item.roi) ? `${item.roi.toFixed(1)}%` : '∞'}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right',
                            item.margin < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          )}
                        >
                          {isFinite(item.margin) ? `${item.margin.toFixed(1)}%` : '∞'}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Progress
                                  value={
                                    isFinite(item.margin) && item.margin > 0
                                      ? Math.min(item.margin, 100)
                                      : 0
                                  }
                                  className={cn(
                                    'h-2',
                                    !isFinite(item.margin) || item.margin <= 0
                                      ? 'bg-red-200 [&>*]:bg-red-500'
                                      : item.margin < 15
                                        ? 'bg-yellow-200 [&>*]:bg-yellow-500'
                                        : 'bg-green-200 [&>*]:bg-green-500'
                                  )}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  Margin:{' '}
                                  {isFinite(item.margin) ? `${item.margin.toFixed(1)}%` : '∞'}
                                </p>
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

            {/* How to Use Section */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-2 text-sm font-medium">How to use this calculator:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Upload a CSV file with columns: product, cost, price, fees</li>
                <li>Or manually enter product details in the form</li>
                <li>View calculated profit, ROI, and profit margin</li>
                <li>Use the results to make informed decisions about your FBA products</li>
                <li>Export the results to CSV for further analysis</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
