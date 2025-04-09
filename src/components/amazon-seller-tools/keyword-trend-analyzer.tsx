'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info, Upload, AlertCircle, LineChart as LineChartIcon, Download } from 'lucide-react'; // Renamed icon import
import SampleCsvButton from './sample-csv-button';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
import { useIsMobile } from '../../hooks/use-mobile'; // Added for responsive chart

// --- Interfaces and Types ---

// Raw data structure expected from CSV
interface RawTrendData {
  date: string;
  [keyword: string]: string | number; // Allow string from CSV, keyword columns are dynamic
}

// Processed data structure for the chart
interface ChartDataPoint {
  name: string; // Date formatted for display
  [keyword: string]: number | string; // Keyword values should be numbers
}

// --- Constants ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const REQUIRED_COLUMNS: string[] = ['date']; // Only 'date' is strictly required, keywords are dynamic

// --- Helper Functions ---

// Simple hash function for consistent color generation
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// --- Component ---

export default function KeywordTrendAnalyzer() {
  const { toast } = useToast();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]); // Store identified keyword columns
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Clear error when data changes
  useEffect(() => {
    if (chartData.length > 0) {
      setError(null);
    }
  }, [chartData]);

  // --- Data Processing Logic ---
  const processAndSetData = useCallback(
    (rawData: RawTrendData[]) => {
      if (!rawData || rawData.length === 0) {
        setError('No valid trend data to process.');
        setChartData([]);
        setKeywords([]);
        return;
      }

      setIsLoading(true); // Indicate processing state

      try {
        // Identify keyword columns (all columns except 'date')
        const identifiedKeywords = Object.keys(rawData[0] || {}).filter(
          key => key.toLowerCase() !== 'date'
        );
        if (identifiedKeywords.length === 0) {
          throw new Error(
            "No keyword columns found in the CSV. Ensure columns other than 'date' exist."
          );
        }
        setKeywords(identifiedKeywords);

        const processedChartData: ChartDataPoint[] = rawData
          .map((row, index) => {
            // Validate date
            const dateStr = String(row.date);
            const dateObj = new Date(dateStr);
            if (isNaN(dateObj.getTime())) {
              console.warn(`Invalid date format in row ${index + 1}: '${dateStr}'. Skipping row.`);
              return null; // Skip rows with invalid dates
            }
            // Format date for display (e.g., 'YYYY-MM-DD' or 'MM/DD')
            const formattedDate = dateObj.toLocaleDateString('en-CA'); // Example: 'YYYY-MM-DD'

            const dataPoint: ChartDataPoint = { name: formattedDate };

            identifiedKeywords.forEach(keyword => {
              const value = row[keyword];
              const numValue = Number(value);
              if (value === '' || value === null || value === undefined || isNaN(numValue)) {
                // Handle missing or invalid numeric data - set to null or 0? Let's use null for gaps.
                dataPoint[keyword] = null;
                console.warn(
                  `Invalid or missing value for keyword '${keyword}' in row ${index + 1}. Setting to null.`
                );
              } else {
                dataPoint[keyword] = numValue;
              }
            });
            return dataPoint;
          })
          .filter((item): item is ChartDataPoint => item !== null) // Remove skipped rows
          .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Sort by date ascending

        if (processedChartData.length === 0) {
          throw new Error('No valid data points could be processed after validation.');
        }

        setChartData(processedChartData);

        toast({
          title: 'Analysis Complete',
          description: `Trend data for ${identifiedKeywords.length} keyword(s) processed successfully.`,
          variant: 'default',
        });
        setError(null); // Clear any previous error
      } catch (err) {
        const errorMsg = `Failed to process trend data: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMsg);
        toast({ title: 'Processing Error', description: errorMsg, variant: 'destructive' });
        setChartData([]); // Clear data on error
        setKeywords([]);
      } finally {
        setIsLoading(false); // End processing state
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
      setChartData([]); // Clear previous data
      setKeywords([]);

      // Using PapaParse directly for CSV processing
      Papa.parse<RawTrendData>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep values as strings initially for better validation control
        // Simulate progress
        chunk: (results, parser) => {
          if (file.size > 0) {
            // Estimate progress based on bytes processed
            // Note: PapaParse chunk size isn't directly related to file size progress
            // This provides a basic indication rather than precise percentage.
            const approxProgress = (parser.streamer.bytesRead / file.size) * 100;
            setUploadProgress(Math.min(approxProgress, 99)); // Cap at 99 until complete
          }
        },
        complete: result => {
          setUploadProgress(100); // Mark parsing as complete

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

          // Basic validation: Check for 'date' column and at least one other column
          const headers = result.meta.fields;
          if (!headers || !headers.includes('date') || headers.length < 2) {
            const errMsg = "CSV must contain a 'date' column and at least one keyword column.";
            setError(errMsg);
            toast({ title: 'Upload Error', description: errMsg, variant: 'destructive' });
            setIsLoading(false);
            setUploadProgress(null);
            return;
          }

          const validData = result.data.filter(row => row.date); // Basic filter for rows with a date

          if (validData.length === 0) {
            setError('No valid data rows (with dates) found in the CSV file.');
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
          processAndSetData(validData);
        },
        error: error => {
          const errorMsg = `Failed to parse CSV: ${error.message}`;
          setError(errorMsg);
          toast({ title: 'Upload Error', description: errorMsg, variant: 'destructive' });
          setChartData([]);
          setKeywords([]);
          setIsLoading(false);
          setUploadProgress(null);
        },
      });
    },
    [toast, processAndSetData]
  );

  const clearAllData = useCallback(() => {
    setChartData([]);
    setKeywords([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Data Cleared', description: 'All keyword trend data has been cleared.' });
  }, [toast]);

  const handleExport = useCallback(() => {
    if (chartData.length === 0) {
      setError('No data to export');
      toast({ title: 'Export Error', description: 'No data to export.', variant: 'destructive' });
      return;
    }

    try {
      // Papa unparse expects objects, chartData is already in the correct format
      const csv = Papa.unparse(chartData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'keyword_trends_data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: 'Export Success',
        description: 'Keyword trend data exported successfully.',
        variant: 'default',
      });
    } catch (error) {
      const errorMsg = `Error exporting data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMsg);
      toast({ title: 'Export Error', description: errorMsg, variant: 'destructive' });
    }
  }, [chartData, toast]);

  const canExport = chartData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Trend Analyzer</CardTitle>
        <CardDescription>
          Upload a CSV file with dates and keyword metrics (e.g., search volume, rank) to visualize
          trends over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Format Info */}
        <CsvRequirements requiredColumns={['date']} maxFileSize="5MB" />

        {/* Input Section */}
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-md font-semibold mb-2">1. Upload Trend Data</h3>
          <Label htmlFor="csv-upload" className="flex items-center gap-1 mb-1 text-sm font-medium">
            Keyword Trend Data (CSV)
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Requires 'date' column and numeric keyword columns.
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
              {chartData.length > 0 ? `${keywords.length} Keyword(s) Loaded` : 'Choose CSV File...'}
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
              dataType="keyword"
              fileName="sample-keyword-trend.csv"
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
          {chartData.length > 0 && !isLoading && (
            <p className="text-xs text-green-600 mt-1">
              {keywords.length} keyword(s) loaded with {chartData.length} data points.
            </p>
          )}
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
            Export Data
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
            <LineChartIcon className="mx-auto h-6 w-6 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing trends...</p>
          </div>
        )}

        {/* Results Display */}
        {chartData.length > 0 && !isLoading && (
          <div className="mt-6 space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="text-md font-semibold mb-4">Keyword Trends Over Time</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: isMobile ? 5 : 20,
                      left: isMobile ? -15 : 5, // Adjust left margin for smaller screens
                      bottom: isMobile ? 40 : 20, // More bottom margin for angled labels if needed
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="name" // Date
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? 'end' : 'middle'}
                      height={isMobile ? 60 : 30}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      // interval={isMobile ? 'preserveStartEnd' : 0} // Adjust interval for readability on mobile
                      interval={'preserveStartEnd'} // Show fewer labels if crowded
                      minTickGap={isMobile ? 40 : 20} // Minimum gap between ticks
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{ fontSize: '12px', padding: '5px 10px' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: isMobile ? 10 : 20, fontSize: '12px' }} />
                    {keywords.map(key => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={key} // Use keyword as name
                        stroke={stringToColor(key)} // Generate color based on keyword
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                        connectNulls={true} // Connect line across null points (gaps)
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Optional: Add a table view of the data here if desired */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
