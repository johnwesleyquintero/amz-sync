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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import {
  Info,
  Upload,
  AlertCircle,
  Calculator,
  Download,
  BarChartHorizontalBig,
} from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { BatchProcessor } from '@/lib/enhanced-csv-utils'; // Using the enhanced CSV processor
import SampleCsvButton from './sample-csv-button';
import { calculateMetrics, getAcosColor, getAcosRating, type CampaignData } from '@/lib/acos-utils'; // Assuming acos-utils exports these

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const REQUIRED_COLUMNS: (keyof CampaignData | string)[] = ['campaign', 'adSpend', 'sales']; // Essential columns

// Chart Colors (Example)
const CHART_COLORS = {
  adSpend: '#ef4444', // Red
  sales: '#22c55e', // Green
  acos: '#f97316', // Orange
  roas: '#3b82f6', // Blue
};

// Interface for manual campaign input
interface ManualCampaignInput {
  campaign: string;
  adSpend: string;
  sales: string;
  impressions?: string; // Optional
  clicks?: string; // Optional
}

// Interface for chart data points
interface ChartDataPoint {
  name: string; // Campaign name
  adSpend?: number;
  sales?: number;
  acos?: number;
  roas?: number;
  // Add other metrics if needed for charts
}

export default function AcosCalculator() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]); // Holds full calculated data
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null); // Formatted for charts
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCampaign, setManualCampaign] = useState<ManualCampaignInput>({
    campaign: '',
    adSpend: '',
    sales: '',
    impressions: '',
    clicks: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Clear error when data changes
  useEffect(() => {
    if (campaigns.length > 0) {
      setError(null);
    }
  }, [campaigns]);

  // Centralized function to process data (from CSV or manual) and update state
  const processAndSetData = useCallback(
    (data: CampaignData[]) => {
      if (!data || data.length === 0) {
        setError('No valid campaign data to process.');
        setCampaigns([]);
        setChartData(null);
        return;
      }

      try {
        setIsLoading(true); // Indicate processing state

        const calculatedCampaigns = data
          .map(item => {
            // Ensure numeric types, default optional to undefined if invalid
            const adSpend = Number(item.adSpend);
            const sales = Number(item.sales);
            const impressions = item.impressions ? Number(item.impressions) : undefined;
            const clicks = item.clicks ? Number(item.clicks) : undefined;

            // Basic validation within map
            if (isNaN(adSpend) || isNaN(sales)) {
              console.warn(`Skipping campaign '${item.campaign}' due to invalid numeric data.`);
              // Return a minimal structure or null/undefined to filter later if needed
              return null;
            }

            const metrics = calculateMetrics({ adSpend, sales, impressions, clicks });
            return {
              campaign: String(item.campaign),
              adSpend,
              sales,
              impressions: !isNaN(impressions) ? impressions : undefined,
              clicks: !isNaN(clicks) ? clicks : undefined,
              ...metrics, // Add calculated acos, roas, etc.
            };
          })
          .filter((item): item is CampaignData => item !== null); // Filter out invalid entries

        if (calculatedCampaigns.length === 0) {
          throw new Error('No valid campaigns found after processing.');
        }

        setCampaigns(calculatedCampaigns);

        // Format data for the chart
        const formattedChartData = calculatedCampaigns.map(c => ({
          name: c.campaign,
          adSpend: c.adSpend,
          sales: c.sales,
          acos: c.acos,
          roas: c.roas,
        }));
        setChartData(formattedChartData);

        toast({
          title: 'Calculation Complete',
          description: `${calculatedCampaigns.length} campaign(s) processed successfully.`,
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
        const batchProcessor = new BatchProcessor<CampaignData>();
        // Explicitly cast REQUIRED_COLUMNS if needed, or ensure CampaignData keys match
        const result = await batchProcessor.processFile(
          file,
          progress => setUploadProgress(progress * 100),
          REQUIRED_COLUMNS as (keyof CampaignData)[] // Cast if necessary
        );

        if (result.errors.length > 0) {
          const errorMsg = `CSV processing completed with errors: ${result.errors
            .slice(0, 3)
            .map(e => `Row ${e.row}: ${e.message}`)
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

  const handleManualCalculate = () => {
    setError(null); // Clear previous errors

    // --- Validation ---
    if (!manualCampaign.campaign.trim()) {
      setError('Please enter a campaign name');
      toast({
        title: 'Input Error',
        description: 'Campaign name is required.',
        variant: 'destructive',
      });
      return;
    }
    const adSpend = Number.parseFloat(manualCampaign.adSpend);
    const sales = Number.parseFloat(manualCampaign.sales);
    const impressions = manualCampaign.impressions
      ? Number.parseFloat(manualCampaign.impressions)
      : undefined;
    const clicks = manualCampaign.clicks ? Number.parseFloat(manualCampaign.clicks) : undefined;

    if (isNaN(adSpend) || adSpend < 0) {
      setError('Ad Spend must be a valid non-negative number');
      toast({ title: 'Input Error', description: 'Invalid Ad Spend.', variant: 'destructive' });
      return;
    }
    if (isNaN(sales) || sales < 0) {
      setError('Sales must be a valid non-negative number');
      toast({ title: 'Input Error', description: 'Invalid Sales amount.', variant: 'destructive' });
      return;
    }
    // Optional fields validation (only if provided)
    if (manualCampaign.impressions && (isNaN(impressions) || impressions < 0)) {
      setError('Impressions must be a valid non-negative number if provided');
      toast({ title: 'Input Error', description: 'Invalid Impressions.', variant: 'destructive' });
      return;
    }
    if (manualCampaign.clicks && (isNaN(clicks) || clicks < 0)) {
      setError('Clicks must be a valid non-negative number if provided');
      toast({ title: 'Input Error', description: 'Invalid Clicks.', variant: 'destructive' });
      return;
    }
    // ACOS specific validation (avoid division by zero)
    // Note: calculateMetrics handles sales=0 returning acos=0 or Infinity based on spend
    // if (sales === 0 && adSpend > 0) {
    //   // Let calculateMetrics handle this, it might return Infinity or a specific value
    // }

    // --- Create new campaign data ---
    const newCampaign: CampaignData = {
      campaign: manualCampaign.campaign.trim(),
      adSpend,
      sales,
      impressions: impressions, // Pass validated or undefined
      clicks: clicks, // Pass validated or undefined
      // Metrics will be calculated in processAndSetData
    };

    // --- Process and update state ---
    processAndSetData([...campaigns, newCampaign]); // Add to existing and re-process all

    // --- Reset form ---
    setManualCampaign({ campaign: '', adSpend: '', sales: '', impressions: '', clicks: '' });
  };

  const clearAllData = () => {
    setCampaigns([]);
    setChartData(null);
    setError(null);
    setManualCampaign({ campaign: '', adSpend: '', sales: '', impressions: '', clicks: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Data Cleared', description: 'All input and results have been cleared.' });
  };

  const handleExport = () => {
    if (campaigns.length === 0) {
      setError('No data to export');
      toast({ title: 'Export Error', description: 'No data to export.', variant: 'destructive' });
      return;
    }
    // Existing export logic... (seems fine)
    try {
      const exportData = campaigns.map(campaign => ({
        campaign: campaign.campaign,
        adSpend: campaign.adSpend.toFixed(2),
        sales: campaign.sales.toFixed(2),
        acos: campaign.acos?.toFixed(2) ?? 'N/A', // Use ?? for nullish coalescing
        roas: campaign.roas?.toFixed(2) ?? 'N/A',
        impressions: campaign.impressions ?? '',
        clicks: campaign.clicks ?? '',
        ctr: campaign.ctr?.toFixed(2) ?? '',
        cpc: campaign.cpc?.toFixed(2) ?? '',
        conversionRate: campaign.conversionRate?.toFixed(2) ?? '',
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'acos_calculations.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up blob URL
      toast({
        title: 'Export Success',
        description: 'Campaign data exported successfully.',
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
      acc.totalSpend += campaign.adSpend;
      acc.totalSales += campaign.sales;
      acc.campaignCount += 1;
      if (campaign.acos !== undefined && campaign.acos !== null && isFinite(campaign.acos)) {
        acc.acosSum += campaign.acos;
        acc.acosCount += 1;
      }
      return acc;
    },
    { totalSpend: 0, totalSales: 0, acosSum: 0, campaignCount: 0, acosCount: 0 }
  );

  const averageAcos = summary.acosCount > 0 ? summary.acosSum / summary.acosCount : 0;
  const overallRoas = summary.totalSpend > 0 ? summary.totalSales / summary.totalSpend : 0;

  const canCalculateOrExport = campaigns.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ACoS & ROAS Calculator</CardTitle>
        <CardDescription>
          Analyze Advertising Cost of Sales (ACoS) and Return on Ad Spend (ROAS) for your campaigns.
          Upload a CSV or enter data manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Upload */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold mb-2">1. Upload CSV Data</h3>
            <Label
              htmlFor="csv-upload"
              className="flex items-center gap-1 mb-1 text-sm font-medium"
            >
              Campaign Data (CSV)
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      Required columns: {REQUIRED_COLUMNS.join(', ')}. Optional: impressions,
                      clicks.
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
                dataType="acos"
                fileName="sample-acos-calculator.csv"
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
                {campaigns.length} campaign(s) loaded from file.
              </p>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold mb-2">2. Or Enter Manually</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="manual-campaign" className="text-sm">
                  Campaign Name
                </Label>
                <Input
                  id="manual-campaign"
                  value={manualCampaign.campaign}
                  onChange={e => setManualCampaign({ ...manualCampaign, campaign: e.target.value })}
                  placeholder="e.g., Summer Sale Auto"
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="manual-adSpend" className="text-sm">
                    Ad Spend ($)
                  </Label>
                  <Input
                    id="manual-adSpend"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualCampaign.adSpend}
                    onChange={e =>
                      setManualCampaign({ ...manualCampaign, adSpend: e.target.value })
                    }
                    placeholder="0.00"
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-sales" className="text-sm">
                    Sales ($)
                  </Label>
                  <Input
                    id="manual-sales"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualCampaign.sales}
                    onChange={e => setManualCampaign({ ...manualCampaign, sales: e.target.value })}
                    placeholder="0.00"
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>
              </div>
              {/* Optional Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="manual-impressions" className="text-sm">
                    Impressions <span className="text-muted-foreground">(Opt.)</span>
                  </Label>
                  <Input
                    id="manual-impressions"
                    type="number"
                    min="0"
                    step="1"
                    value={manualCampaign.impressions}
                    onChange={e =>
                      setManualCampaign({ ...manualCampaign, impressions: e.target.value })
                    }
                    placeholder="e.g., 10000"
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="manual-clicks" className="text-sm">
                    Clicks <span className="text-muted-foreground">(Opt.)</span>
                  </Label>
                  <Input
                    id="manual-clicks"
                    type="number"
                    min="0"
                    step="1"
                    value={manualCampaign.clicks}
                    onChange={e => setManualCampaign({ ...manualCampaign, clicks: e.target.value })}
                    placeholder="e.g., 150"
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>
              </div>
              <Button
                onClick={handleManualCalculate}
                disabled={isLoading}
                size="sm"
                className="w-full"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Add & Calculate
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          {/* No separate "Analyze" button needed as calculation happens on input/upload */}
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
            disabled={!canCalculateOrExport || isLoading}
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
                    <span className={getAcosColor(averageAcos)}>{averageAcos.toFixed(2)}%</span>
                    {' / '}
                    <span>{overallRoas.toFixed(2)}x</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Bar Chart */}
            <div className="rounded-lg border p-4">
              <h3 className="text-md font-semibold mb-4">Campaign Performance Comparison</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: isMobile ? 5 : 20,
                      left: isMobile ? -15 : 5,
                      bottom: isMobile ? 60 : 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="name" // Campaign name
                      angle={isMobile ? -60 : 0}
                      textAnchor={isMobile ? 'end' : 'middle'}
                      height={isMobile ? 80 : 40} // Adjust height for angled labels
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      interval={0} // Show all labels
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke={CHART_COLORS.adSpend}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={CHART_COLORS.acos}
                      tick={{ fontSize: 12 }}
                    />
                    <RechartsTooltip
                      contentStyle={{ fontSize: '12px', padding: '5px 10px' }}
                      itemStyle={{ padding: '2px 0' }}
                      formatter={(value, name) => {
                        if (name === 'acos' || name === 'roas')
                          return `${Number(value).toFixed(2)}${name === 'acos' ? '%' : 'x'}`;
                        if (name === 'adSpend' || name === 'sales')
                          return `$${Number(value).toFixed(2)}`;
                        return value;
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: isMobile ? 15 : 20, fontSize: '12px' }} />
                    <Bar
                      yAxisId="left"
                      dataKey="adSpend"
                      name="Ad Spend"
                      fill={CHART_COLORS.adSpend}
                    />
                    <Bar yAxisId="left" dataKey="sales" name="Sales" fill={CHART_COLORS.sales} />
                    <Bar yAxisId="right" dataKey="acos" name="ACoS (%)" fill={CHART_COLORS.acos} />
                    {/* <Bar yAxisId="right" dataKey="roas" name="ROAS (x)" fill={CHART_COLORS.roas} /> */}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-lg border p-4">
              <h3 className="text-md font-semibold mb-4">Detailed Campaign Data</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead className="text-right">Ad Spend</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">ACoS</TableHead>
                      <TableHead className="text-right">ROAS</TableHead>
                      <TableHead className="text-right">Impressions</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">CTR</TableHead>
                      <TableHead className="text-right">CPC</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{campaign.campaign}</TableCell>
                        <TableCell className="text-right">${campaign.adSpend.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${campaign.sales.toFixed(2)}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${getAcosColor(campaign.acos ?? 0)}`}
                        >
                          {campaign.acos?.toFixed(2) ?? 'N/A'}%
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.roas?.toFixed(2) ?? 'N/A'}x
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.impressions?.toLocaleString() ?? 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.clicks?.toLocaleString() ?? 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.ctr?.toFixed(2) ?? 'N/A'}%
                        </TableCell>
                        <TableCell className="text-right">
                          ${campaign.cpc?.toFixed(2) ?? 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.conversionRate?.toFixed(2) ?? 'N/A'}%
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getAcosRating(campaign.acos ?? Infinity).variant}>
                            {getAcosRating(campaign.acos ?? Infinity).label}
                          </Badge>
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
