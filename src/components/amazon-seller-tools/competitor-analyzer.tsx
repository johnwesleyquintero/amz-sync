'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
} from 'recharts';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info, FileText, Upload, AlertCircle, BarChartHorizontalBig } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { ProcessedRow, ChartDataPoint, MetricType } from '@/lib/amazon-types'; // Combined MetricType here
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { BatchProcessor } from '@/lib/enhanced-csv-utils';
import SampleCsvButton from './sample-csv-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Chart Colors (centralized)
const getChartColor = (metric: MetricType): string => {
  const colors: Record<MetricType, string> = {
    price: '#8884d8',
    reviews: '#82ca9d',
    rating: '#ffc658',
    sales_velocity: '#a4de6c',
    inventory_levels: '#d0ed57',
    conversion_rate: '#cc79cd',
    click_through_rate: '#7ac5d8',
    // Add default colors for any potential future metrics
  };
  return colors[metric] || '#000000'; // Default to black if metric not found
};

// Available metrics for selection
const AVAILABLE_METRICS: MetricType[] = [
  'price',
  'reviews',
  'rating',
  'sales_velocity',
  'inventory_levels',
  'conversion_rate',
  'click_through_rate',
];

// Required columns for CSV validation
const REQUIRED_COLUMNS: (keyof ProcessedRow)[] = [
  'asin',
  'price',
  'reviews',
  'rating',
  'conversion_rate',
  'click_through_rate',
  // Add other essential columns if needed for basic functionality
];

export default function CompetitorAnalyzer() {
  const { toast } = useToast();
  const [asinInput, setAsinInput] = useState(''); // Renamed to avoid confusion with actual ASIN data
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>([
    'price',
    'reviews',
    'rating',
  ]);
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [sellerData, setSellerData] = useState<ProcessedRow | null>(null);
  const [competitorData, setCompetitorData] = useState<ProcessedRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sellerFileInputRef = useRef<HTMLInputElement>(null);
  const competitorFileInputRef = useRef<HTMLInputElement>(null);

  const isMobile = useIsMobile();

  // Clear error when relevant state changes
  useEffect(() => {
    if (sellerData || competitorData.length > 0) {
      setError(null);
    }
  }, [sellerData, competitorData]);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, type: 'seller' | 'competitor') => {
      const file = event.target.files?.[0];
      // Reset the input value to allow re-uploading the same file
      if (event.target) {
        event.target.value = '';
      }

      if (!file) {
        // No toast needed if the user simply cancels the file dialog
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

      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: 'Error',
          description: 'Invalid file type. Please upload a CSV file.',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      setUploadProgress(0);
      setError(null); // Clear previous errors
      setChartData(null); // Clear previous chart data

      try {
        const batchProcessor = new BatchProcessor<ProcessedRow>();
        const result = await batchProcessor.processFile(
          file,
          progress => setUploadProgress(progress * 100),
          REQUIRED_COLUMNS // Pass required columns for validation
        );

        if (result.errors.length > 0) {
          const errorMsg = `CSV processing completed with errors: ${result.errors
            .slice(0, 3) // Show first few errors
            .map(e => `Row ${e.row}: ${e.message}`)
            .join('; ')}...`;
          console.warn('CSV Processing Errors:', result.errors);
          setError(errorMsg); // Show error in UI
          toast({
            title: 'CSV Warning',
            description: 'Some rows had errors and were skipped. Check console for details.',
            variant: 'default', // Use warning/default instead of destructive if some data is valid
          });
        }

        if (result.data.length === 0 && result.errors.length > 0) {
          throw new Error('No valid data found in the CSV file after processing errors.');
        }

        if (type === 'seller') {
          if (result.data.length > 0) {
            setSellerData(result.data[0]); // Use the first valid row
            toast({
              title: 'Success',
              description: `Seller data loaded from ${file.name}`,
              variant: 'default',
            });
          } else {
            setSellerData(null); // Clear seller data if no valid row found
            throw new Error('No valid seller data row found in the uploaded file.');
          }
        } else {
          setCompetitorData(result.data);
          if (result.data.length > 0) {
            toast({
              title: 'Success',
              description: `${result.data.length} competitor(s) loaded from ${file.name}`,
              variant: 'default',
            });
          } else {
            throw new Error('No valid competitor data rows found in the uploaded file.');
          }
        }
      } catch (error) {
        const errorMsg = `Failed to process ${type} CSV: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        setError(errorMsg);
        toast({
          title: 'Upload Error',
          description: errorMsg,
          variant: 'destructive',
        });
        // Clear data on critical error
        if (type === 'seller') setSellerData(null);
        else setCompetitorData([]);
      } finally {
        setIsLoading(false);
        setUploadProgress(null);
      }
    },
    [toast]
  );

  const analyzeCompetitor = useCallback(() => {
    setError(null); // Clear previous errors
    if (!sellerData) {
      setError('Seller data is missing. Please upload the seller CSV file.');
      toast({
        title: 'Missing Data',
        description: 'Seller data CSV is required.',
        variant: 'destructive',
      });
      return;
    }
    if (competitorData.length === 0) {
      setError('Competitor data is missing. Please upload the competitor CSV file.');
      toast({
        title: 'Missing Data',
        description: 'Competitor data CSV is required.',
        variant: 'destructive',
      });
      return;
    }
    if (selectedMetrics.length === 0) {
      setError('No metrics selected. Please choose at least one metric to compare.');
      toast({
        title: 'Missing Selection',
        description: 'Please select metrics to compare.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true); // Use isLoading for analysis phase as well

    try {
      // Format competitor data
      const formattedCompetitors = competitorData.map(row => {
        const competitorName = row.asin || `Competitor ${row.id || 'N/A'}`; // Use ASIN or fallback ID
        const dataPoint: ChartDataPoint = { name: competitorName };

        selectedMetrics.forEach(metric => {
          const value = row[metric as keyof ProcessedRow];
          if (value !== undefined && value !== null && value !== '') {
            const numValue = Number(value); // Attempt conversion
            if (!isNaN(numValue)) {
              dataPoint[metric] = numValue;
            } else {
              console.warn(
                `Invalid numeric value for metric '${metric}' in competitor ${competitorName}: ${value}`
              );
              // Optionally set to null or 0, or omit
              // dataPoint[metric] = null;
            }
          }
        });
        return dataPoint;
      });

      // Format seller data
      const sellerPoint: ChartDataPoint = { name: sellerData.asin || 'Your Product' };
      selectedMetrics.forEach(metric => {
        const value = sellerData[metric as keyof ProcessedRow];
        if (value !== undefined && value !== null && value !== '') {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            sellerPoint[metric] = numValue;
          } else {
            console.warn(`Invalid numeric value for metric '${metric}' in seller data: ${value}`);
            // sellerPoint[metric] = null;
          }
        }
      });

      const finalChartData = [sellerPoint, ...formattedCompetitors];

      if (finalChartData.length <= 1 && competitorData.length === 0) {
        // This case is already handled by initial checks, but as a safeguard
        throw new Error('No competitor data available to render chart.');
      }

      setChartData(finalChartData);
      toast({
        title: 'Analysis Complete',
        description: 'Competitor data analyzed successfully.',
        variant: 'default',
      });
    } catch (error) {
      const errorMsg = `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMsg);
      toast({
        title: 'Analysis Error',
        description: errorMsg,
        variant: 'destructive',
      });
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  }, [sellerData, competitorData, selectedMetrics, toast]);

  const clearAllData = () => {
    setSellerData(null);
    setCompetitorData([]);
    setChartData(null);
    setError(null);
    setAsinInput('');
    // Reset file inputs visually (optional, but good UX)
    if (sellerFileInputRef.current) sellerFileInputRef.current.value = '';
    if (competitorFileInputRef.current) competitorFileInputRef.current.value = '';
    toast({ title: 'Data Cleared', description: 'All input and results have been cleared.' });
  };

  const handleMetricChange = (metric: MetricType, checked: boolean) => {
    setSelectedMetrics(prev => {
      if (checked) {
        return [...prev, metric];
      } else {
        return prev.filter(m => m !== metric);
      }
    });
  };

  const canAnalyze = !!sellerData && competitorData.length > 0 && selectedMetrics.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitor Analyzer</CardTitle>
        <CardDescription>
          Upload CSV files for your product and competitor products to compare key metrics. The ASIN
          input below is currently for reference only and does not fetch data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Upload Section */}
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-md font-semibold mb-2">1. Upload Data Files</h3>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            {/* Seller CSV Input */}
            <div>
              <Label
                htmlFor="seller-csv"
                className="flex items-center gap-1 mb-1 text-sm font-medium"
              >
                Your Product Data (CSV)
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Required columns: {REQUIRED_COLUMNS.join(', ')}. Upload a CSV containing
                        data for your own product. Only the first valid row will be used.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sellerFileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex-grow justify-start text-left"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {sellerData ? `${sellerData.asin || 'File Loaded'}` : 'Choose Seller File...'}
                </Button>
                <Input
                  id="seller-csv"
                  type="file"
                  accept=".csv"
                  ref={sellerFileInputRef}
                  onChange={e => handleFileUpload(e, 'seller')}
                  className="hidden"
                  disabled={isLoading}
                />
                <SampleCsvButton
                  dataType="competitor"
                  fileName="sample-seller-data.csv"
                  size="sm"
                  buttonText="Sample"
                />
              </div>
              {sellerData && <p className="text-xs text-green-600 mt-1">Seller data loaded.</p>}
            </div>

            {/* Competitor CSV Input */}
            <div>
              <Label
                htmlFor="competitor-csv"
                className="flex items-center gap-1 mb-1 text-sm font-medium"
              >
                Competitor Data (CSV)
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Required columns: {REQUIRED_COLUMNS.join(', ')}. Upload a CSV containing
                        data for one or more competitor products.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => competitorFileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex-grow justify-start text-left"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {competitorData.length > 0
                    ? `${competitorData.length} Competitor(s) Loaded`
                    : 'Choose Competitor File...'}
                </Button>
                <Input
                  id="competitor-csv"
                  type="file"
                  accept=".csv"
                  ref={competitorFileInputRef}
                  onChange={e => handleFileUpload(e, 'competitor')}
                  className="hidden"
                  disabled={isLoading}
                />
                <SampleCsvButton
                  dataType="competitor"
                  fileName="sample-competitors-data.csv"
                  size="sm"
                  buttonText="Sample"
                />
              </div>
              {competitorData.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {competitorData.length} competitor(s) loaded.
                </p>
              )}
            </div>
          </div>
          {/* Loading Indicator */}
          {isLoading && uploadProgress !== null && (
            <div className="mt-2 space-y-1">
              <Progress value={uploadProgress} className="h-2 w-full" />
              <p className="text-xs text-muted-foreground text-center">
                Processing file... {uploadProgress.toFixed(0)}%
              </p>
            </div>
          )}
        </div>

        {/* ASIN Input (Reference Only) */}
        <div>
          <Label htmlFor="asinInput" className="text-sm font-medium">
            Competitor ASIN or Niche (Reference Only)
          </Label>
          <Input
            id="asinInput"
            value={asinInput}
            onChange={e => setAsinInput(e.target.value)}
            placeholder="e.g., B08N5KWB9H or 'wireless earbuds'"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This input is for context and does not currently fetch data.
          </p>
        </div>

        {/* Metric Selection */}
        <div className="space-y-2 rounded-lg border p-4">
          <h3 className="text-md font-semibold mb-2">2. Select Metrics to Compare</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
            {AVAILABLE_METRICS.map(metric => (
              <div key={metric} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`metric-${metric}`}
                  checked={selectedMetrics.includes(metric)}
                  onChange={e => handleMetricChange(metric, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={isLoading}
                />
                <Label htmlFor={`metric-${metric}`} className="text-sm font-normal cursor-pointer">
                  {metric
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={analyzeCompetitor} disabled={!canAnalyze || isLoading} size="sm">
            {isLoading && uploadProgress === null ? ( // Show different text during analysis vs upload
              <>
                <BarChartHorizontalBig className="mr-2 h-4 w-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChartHorizontalBig className="mr-2 h-4 w-4" />
                Analyze Competitors
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllData}
            disabled={isLoading && uploadProgress !== null} // Disable clear during upload
          >
            Clear All Data
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Chart and Table Display */}
        {chartData && !isLoading && (
          <div className="mt-6 space-y-6">
            {/* Line Chart */}
            <div className="rounded-lg border p-4">
              <h3 className="text-md font-semibold">Comparison Chart</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: isMobile ? 5 : 20, // Adjust margins for mobile
                      left: isMobile ? -10 : 5, // Adjust margins for mobile
                      bottom: isMobile ? 40 : 20, // More bottom margin for angled labels
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="name"
                      angle={isMobile ? -45 : 0} // Angle labels on mobile
                      textAnchor={isMobile ? 'end' : 'middle'}
                      height={isMobile ? 60 : 30} // Allocate more height for angled labels
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      interval={0} // Ensure all labels are shown, adjust if too crowded
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{ fontSize: '12px', padding: '5px 10px' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: isMobile ? 10 : 20, fontSize: '12px' }} />
                    {selectedMetrics.map(metric => (
                      <Line
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        name={metric
                          .split('_')
                          .map(w => w[0].toUpperCase() + w.slice(1))
                          .join(' ')} // Format legend name
                        stroke={getChartColor(metric)}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="rounded-lg border p-4">
              <h3 className="text-md font-semibold">Metric Comparison</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: isMobile ? 5 : 20,
                      left: isMobile ? -10 : 5,
                      bottom: isMobile ? 40 : 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="name"
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? 'end' : 'middle'}
                      height={isMobile ? 60 : 30}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{ fontSize: '12px', padding: '5px 10px' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: isMobile ? 10 : 20, fontSize: '12px' }} />
                    {selectedMetrics.map(metric => (
                      <Bar
                        key={metric}
                        dataKey={metric}
                        name={metric
                          .split('_')
                          .map(w => w[0].toUpperCase() + w.slice(1))
                          .join(' ')}
                        fill={getChartColor(metric)}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-lg border p-4">
              <h3 className="text-md font-semibold">Data Table</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      {selectedMetrics.map(metric => (
                        <TableHead key={metric}>
                          {metric
                            .split('_')
                            .map(w => w[0].toUpperCase() + w.slice(1))
                            .join(' ')}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.map(row => (
                      <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        {selectedMetrics.map(metric => (
                          <TableCell key={metric}>
                            {row[metric] !== undefined ? row[metric] : 'N/A'}
                          </TableCell>
                        ))}
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
