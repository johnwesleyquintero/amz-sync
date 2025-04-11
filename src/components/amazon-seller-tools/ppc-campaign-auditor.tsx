'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { Button } from '../ui/button';
import { Input } from '../ui/input'; // Keep Input for potential future use
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import {
  Info,
  Upload,
  AlertCircle,
  Download,
  BarChartHorizontalBig,
  CheckCircle,
  TrendingDown,
} from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { BatchProcessor } from '@/lib/enhanced-csv-utils'; // Using the enhanced CSV processor
import SampleCsvButton from './sample-csv-button';
import { cn } from '@/lib/utils';
import Papa from 'papaparse'; // Keep Papa for export
import { downloadSampleCsv } from '@/lib/generate-sample-csv';

// --- Interfaces and Types ---

// Raw data structure expected from CSV
interface RawCampaignData {
  name: string;
  type: string;
  spend: string | number; // Allow string from CSV
  sales: string | number; // Allow string from CSV
  impressions: string | number; // Allow string from CSV
  clicks: string | number; // Allow string from CSV
  // Add other potential raw columns if needed
}

// Processed data structure with calculated metrics
export interface ProcessedCampaignData {
  id: string; // Add a unique ID for keys
  name: string;
  type: string;
  spend: number;
  sales: number;
  impressions: number;
  clicks: number;
  acos: number | null; // Can be null if sales are 0
  ctr: number | null; // Can be null if impressions are 0
  cpc: number | null; // Can be null if clicks are 0
  conversionRate: number | null; // Can be null if clicks are 0
  roas: number | null; // Can be null if spend is 0
  issues: string[];
  recommendations: string[];
}

// Data structure for charts
interface ChartDataPoint {
  name: string; // Campaign name
  spend?: number;
  sales?: number;
  acos?: number | null;
  roas?: number | null;
  ctr?: number | null;
  // Add other metrics as needed for charts
}

// --- Constants ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const REQUIRED_COLUMNS: (keyof RawCampaignData)[] = [
  'name',
  'type',
  'spend',
  'sales',
  'impressions',
  'clicks',
];

// Analysis Thresholds
const MIN_CLICKS_FOR_ANALYSIS = 50; // Adjusted threshold
const MAX_ACOS_THRESHOLD = 35; // Adjusted threshold
const MIN_CTR_THRESHOLD = 0.25; // Adjusted threshold
const MIN_CONVERSION_RATE_THRESHOLD = 5; // Adjusted threshold

// Chart Colors
const CHART_COLORS = {
  spend: '#ef4444', // Red
  sales: '#22c55e', // Green
  acos: '#f97316', // Orange
  roas: '#3b82f6', // Blue
  ctr: '#a855f7', // Purple
};

// --- Helper Functions ---

const analyzeCampaign = (campaign: RawCampaignData, id: string): ProcessedCampaignData => {
  // Convert raw data (potentially strings) to numbers, handling invalid values
  const spend = Number(campaign.spend);
  const sales = Number(campaign.sales);
  const impressions = Number(campaign.impressions);
  const clicks = Number(campaign.clicks);

  // Basic validation for essential numeric fields
  if (isNaN(spend) || isNaN(sales) || isNaN(impressions) || isNaN(clicks)) {
    console.warn(`Skipping analysis for campaign '${campaign.name}' due to invalid numeric data.`);
    // Return a minimal structure indicating the issue or handle as needed
    return {
      id,
      name: campaign.name || 'Invalid Data',
      type: campaign.type || 'N/A',
      spend: NaN,
      sales: NaN,
      impressions: NaN,
      clicks: NaN,
      acos: null,
      ctr: null,
      cpc: null,
      conversionRate: null,
      roas: null,
      issues: ['Invalid numeric data (spend, sales, impressions, or clicks)'],
      recommendations: [],
    };
  }

  // Calculate metrics, handling division by zero
  const acos = sales > 0 ? (spend / sales) * 100 : spend > 0 ? Infinity : 0; // ACoS is Infinity if spend > 0 and sales = 0, else 0
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : null;
  const cpc = clicks > 0 ? spend / clicks : null;
  const conversionRate = clicks > 0 ? (sales / clicks) * 100 : null; // Assuming sales value represents conversion count or value directly tied to clicks
  const roas = spend > 0 ? sales / spend : sales > 0 ? Infinity : 0; // ROAS is Infinity if sales > 0 and spend = 0, else 0

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Analysis logic
  if (acos === Infinity || (acos !== null && acos > MAX_ACOS_THRESHOLD)) {
    issues.push(`High ACoS (${acos === Infinity ? 'Infinite' : acos.toFixed(1) + '%'})`);
    recommendations.push('Review keyword bids, negative keywords, and targeting.');
  }

  if (ctr !== null && ctr < MIN_CTR_THRESHOLD) {
    issues.push(`Low CTR (${ctr.toFixed(1)}%)`);
    recommendations.push('Improve ad copy, main image, or keyword relevance.');
  }

  if (conversionRate !== null && conversionRate < MIN_CONVERSION_RATE_THRESHOLD) {
    issues.push(`Low Conversion Rate (${conversionRate.toFixed(1)}%)`);
    recommendations.push(
      'Optimize listing (price, images, description, reviews), check keyword relevance.'
    );
  }

  if (clicks < MIN_CLICKS_FOR_ANALYSIS) {
    issues.push(`Low Click Volume (${clicks})`);
    recommendations.push(
      'Consider increasing bids or budget for more visibility, check keyword search volume.'
    );
  }

  if (campaign.type === 'Auto' && acos !== null && acos < 20 && acos !== Infinity) {
    recommendations.push('Harvest converting search terms for Manual campaigns.');
  }

  // Add check for zero impressions
  if (impressions === 0) {
    issues.push('Zero Impressions');
    recommendations.push('Check campaign status, budget, bids, and targeting settings.');
  }

  return {
    id,
    name: campaign.name,
    type: campaign.type,
    spend,
    sales,
    impressions,
    clicks,
    acos: isFinite(acos) ? acos : null, // Store Infinity as null for easier handling later
    ctr,
    cpc,
    conversionRate,
    roas: isFinite(roas) ? roas : null, // Store Infinity as null
    issues,
    recommendations,
  };
};

// --- Component ---

export default function PpcCampaignAuditor() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<ProcessedCampaignData[]>([]); // Holds full calculated data
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null); // Formatted for charts
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Clear error when data changes
  useEffect(() => {
    if (campaigns.length > 0) {
      setError(null);
    }
  }, [campaigns]);

  // Centralized function to process data and update state
  const processAndSetData = useCallback(
    (rawData: RawCampaignData[]) => {
      if (!rawData || rawData.length === 0) {
        setError('No valid campaign data found in the source.');
        setCampaigns([]);
        setChartData(null);
        return;
      }

      setIsLoading(true); // Indicate processing state

      try {
        // Use Promise.all if analyzeCampaign becomes async in the future
        const analyzedCampaigns = rawData.map(
          (item, index) => analyzeCampaign(item, `campaign-${index}-${Date.now()}`) // Generate a unique ID
        );

        // Filter out campaigns that had critical data errors during initial conversion
        const validCampaigns = analyzedCampaigns.filter(c => !isNaN(c.spend));

        if (validCampaigns.length === 0) {
          throw new Error('No valid campaigns could be processed after analysis.');
        }

        setCampaigns(validCampaigns);

        // Format data for the chart
        const formattedChartData = validCampaigns.map(c => ({
          name: c.name,
          spend: c.spend,
          sales: c.sales,
          acos: c.acos,
          roas: c.roas,
          ctr: c.ctr,
        }));
        setChartData(formattedChartData);

        toast({
          title: 'Analysis Complete',
          description: `${validCampaigns.length} campaign(s) analyzed successfully.`,
          variant: 'default',
        });
        setError(null); // Clear any previous error
      } catch (err) {
        const errorMsg = `Failed to process campaign data: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMsg);
        toast({ title: 'Processing Error', description: errorMsg, variant: 'destructive' });
        setCampaigns([]); // Clear data on error
        setChartData(null);
      } finally {
        setIsLoading(false); // End processing state
        setUploadProgress(null); // Reset progress if it was an upload
      }
    },
    [toast]
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setCampaigns([]); // Clear previous data
      setChartData(null);

      try {
        const batchProcessor = new BatchProcessor<RawCampaignData>();
        const result = await batchProcessor.processFile(
          file,
          progress => setUploadProgress(progress * 100),
          REQUIRED_COLUMNS
        );

        if (result.errors.length > 0) {
          const errorMsg = `CSV processing completed with errors: ${result.errors
            .slice(0, 3)
            .map(e => `Row ${e.row + 1}: ${e.message}`)
            .join('; ')}...`;
          console.warn('CSV Processing Errors:', result.errors);
          setError(errorMsg);
          toast({
            title: 'CSV Warning',
            description: 'Some rows had errors. Check console.',
            variant: 'default',
          });
        }

        if (result.data.length === 0) {
          throw new Error('No valid data found in the CSV file after processing errors.');
        }

        // Process the valid data
        processAndSetData(result.data); // Use the centralized processing function
      } catch (error) {
        const errorMsg = `Failed to process CSV: ${error instanceof Error ? error.message : 'Unknown error'}`;
        setError(errorMsg);
        toast({ title: 'Upload Error', description: errorMsg, variant: 'destructive' });
        setCampaigns([]); // Clear data on critical error
        setChartData(null);
        setIsLoading(false); // Ensure loading is stopped
        setUploadProgress(null);
      }
      // 'finally' block in processAndSetData handles final state updates
    },
    [toast, processAndSetData] // Add processAndSetData dependency
  );

  const clearAllData = () => {
    setCampaigns([]);
    setChartData(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Data Cleared', description: 'All input and results have been cleared.' });
  };

  const handleExport = () => {
    if (campaigns.length === 0) {
      setError('No data to export');
      toast({ title: 'Export Error', description: 'No data to export.', variant: 'destructive' });
      return;
    }

    try {
      const exportData = campaigns.map(c => ({
        CampaignName: c.name,
        CampaignType: c.type,
        Spend: c.spend.toFixed(2),
        Sales: c.sales.toFixed(2),
        Impressions: c.impressions,
        Clicks: c.clicks,
        ACoS_Percent: c.acos?.toFixed(2) ?? 'N/A',
        ROAS: c.roas?.toFixed(2) ?? 'N/A',
        CTR_Percent: c.ctr?.toFixed(2) ?? 'N/A',
        CPC: c.cpc?.toFixed(2) ?? 'N/A',
        ConversionRate_Percent: c.conversionRate?.toFixed(2) ?? 'N/A',
        Issues: c.issues.join('; ') || 'None',
        Recommendations: c.recommendations.join('; ') || 'None',
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ppc_campaign_audit_results.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up blob URL
      toast({
        title: 'Export Success',
        description: 'Campaign audit exported successfully.',
        variant: 'default',
      });
    } catch (error) {
      const errorMsg = `Error exporting data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMsg);
      toast({ title: 'Export Error', description: errorMsg, variant: 'destructive' });
    }
  };

  // Calculate summary metrics
  const summary = campaigns.reduce(
    (acc, campaign) => {
      if (!isNaN(campaign.spend)) acc.totalSpend += campaign.spend;
      if (!isNaN(campaign.sales)) acc.totalSales += campaign.sales;
      acc.campaignCount += 1;
      if (campaign.acos !== null && isFinite(campaign.acos)) {
        acc.acosSum += campaign.acos;
        acc.acosCount += 1;
      }
      return acc;
    },
    { totalSpend: 0, totalSales: 0, acosSum: 0, campaignCount: 0, acosCount: 0 }
  );

  const averageAcos = summary.acosCount > 0 ? summary.acosSum / summary.acosCount : 0;
  const overallRoas = summary.totalSpend > 0 ? summary.totalSales / summary.totalSpend : 0;

  const canExport = campaigns.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>PPC Campaign Auditor</CardTitle>
        <CardDescription>
          Upload your Amazon PPC campaign data CSV to analyze performance and get optimization
          suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-md font-semibold mb-2">1. Upload Campaign Data</h3>
          <Label htmlFor="csv-upload" className="flex items-center gap-1 mb-1 text-sm font-medium">
            Campaign Data (CSV)
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Required columns: {REQUIRED_COLUMNS.join(', ')}. Download the report from Amazon
                    Ads.
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
              {campaigns.length > 0
                ? `${campaigns.length} Campaign(s) Loaded`
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
              dataType="ppc"
              fileName="sample-ppc-campaign.csv"
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
          {campaigns.length > 0 && !isLoading && (
            <p className="text-xs text-green-600 mt-1">
              {campaigns.length} campaign(s) loaded and analyzed.
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
            Export Audit Results
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Indicator (for general processing/analysis) */}
        {isLoading && uploadProgress === null && (
          <div className="mt-2 space-y-1 text-center">
            <BarChartHorizontalBig className="mx-auto h-6 w-6 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing campaigns...</p>
          </div>
        )}

        {/* Results Display */}
        {chartData && !isLoading && (
          <div className="mt-6 space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Campaigns</CardDescription>
                  <CardTitle className="text-2xl">{summary.campaignCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Ad Spend</CardDescription>
                  <CardTitle className="text-2xl">${summary.totalSpend.toFixed(2)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Sales</CardDescription>
                  <CardTitle className="text-2xl">${summary.totalSales.toFixed(2)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg. ACoS / Overall ROAS</CardDescription>
                  <CardTitle className="text-2xl">
                    <span
                      className={cn(
                        averageAcos > MAX_ACOS_THRESHOLD ? 'text-red-500' : 'text-green-600'
                      )}
                    >
                      {averageAcos.toFixed(1)}%
                    </span>
                    {' / '}
                    <span>{overallRoas.toFixed(2)}x</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Bar Chart */}
            <div className="rounded-lg border p-4">
              <h3 className="text-md font-semibold mb-4">Campaign Performance Overview</h3>
              <div className="h-[450px] w-full">
                {' '}
                {/* Increased height slightly */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: isMobile ? 5 : 20,
                      left: isMobile ? -15 : 5,
                      bottom: isMobile ? 80 : 40,
                    }} // Increased bottom margin
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="name" // Campaign name
                      angle={isMobile ? -65 : -30} // Steeper angle for mobile, slight angle for desktop
                      textAnchor={isMobile ? 'end' : 'end'} // Anchor end for angled labels
                      height={isMobile ? 100 : 60} // Adjust height for angled labels
                      tick={{ fontSize: isMobile ? 9 : 11 }} // Slightly smaller font
                      interval={0} // Show all labels
                    />
                    {/* Define Y-axes */}
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke={CHART_COLORS.spend}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={CHART_COLORS.acos}
                      tick={{ fontSize: 11 }}
                      unit="%"
                    />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: '12px',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                      itemStyle={{ padding: '2px 0' }}
                      formatter={(value, name) => {
                        if (name === 'acos' || name === 'ctr')
                          return `${Number(value).toFixed(1)}%`;
                        if (name === 'roas') return `${Number(value).toFixed(2)}x`;
                        if (name === 'spend' || name === 'sales')
                          return `$${Number(value).toFixed(2)}`;
                        return value;
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: isMobile ? 15 : 20, fontSize: '12px' }} />
                    {/* Define Bars */}
                    <Bar yAxisId="left" dataKey="spend" name="Spend" fill={CHART_COLORS.spend} />
                    <Bar yAxisId="left" dataKey="sales" name="Sales" fill={CHART_COLORS.sales} />
                    <Bar
                      yAxisId="right"
                      dataKey="acos"
                      name="ACoS"
                      fill={CHART_COLORS.acos}
                      unit="%"
                    />
                    {/* <Bar yAxisId="right" dataKey="ctr" name="CTR" fill={CHART_COLORS.ctr} unit="%" /> */}
                    {/* <Bar yAxisId="right" dataKey="roas" name="ROAS" fill={CHART_COLORS.roas} unit="x" /> */}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-lg border p-4">
              <h3 className="text-md font-semibold mb-4">Detailed Campaign Audit</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Spend</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">ACoS</TableHead>
                      <TableHead className="text-right">ROAS</TableHead>
                      <TableHead className="text-right">Impressions</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">CTR</TableHead>
                      <TableHead className="text-right">CPC</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Recommendations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium max-w-xs truncate" title={c.name}>
                          {c.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">${c.spend.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${c.sales.toFixed(2)}</TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-medium',
                            c.acos !== null && c.acos > MAX_ACOS_THRESHOLD
                              ? 'text-red-500'
                              : 'text-green-600'
                          )}
                        >
                          {c.acos?.toFixed(1) ?? 'N/A'}%
                        </TableCell>
                        <TableCell className="text-right">{c.roas?.toFixed(2) ?? 'N/A'}x</TableCell>
                        <TableCell className="text-right">
                          {c.impressions.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{c.clicks.toLocaleString()}</TableCell>
                        <TableCell
                          className={cn(
                            'text-right',
                            c.ctr !== null && c.ctr < MIN_CTR_THRESHOLD ? 'text-red-500' : ''
                          )}
                        >
                          {c.ctr?.toFixed(2) ?? 'N/A'}%
                        </TableCell>
                        <TableCell className="text-right">${c.cpc?.toFixed(2) ?? 'N/A'}</TableCell>
                        <TableCell
                          className={cn(
                            'text-right',
                            c.conversionRate !== null &&
                              c.conversionRate < MIN_CONVERSION_RATE_THRESHOLD
                              ? 'text-red-500'
                              : ''
                          )}
                        >
                          {c.conversionRate?.toFixed(1) ?? 'N/A'}%
                        </TableCell>
                        <TableCell>
                          {c.issues.length > 0 ? (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="destructive">{c.issues.length} Issue(s)</Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <ul className="list-disc list-inside text-xs">
                                    {c.issues.map((issue, i) => (
                                      <li key={i}>{issue}</li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge variant="default">None</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {c.recommendations.length > 0 ? (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline">{c.recommendations.length} Rec(s)</Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <ul className="list-disc list-inside text-xs">
                                    {c.recommendations.map((rec, i) => (
                                      <li key={i}>{rec}</li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge variant="secondary">None</Badge>
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

const handleDownloadSample = () => {
  const csvData = generateSampleCsv('ppc-campaign-auditor');
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ppc-campaign-sample.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
<Button variant="outline" onClick={handleDownloadSample}>
  <Download className="mr-2 h-4 w-4" />
  Download Sample CSV
</Button>;
