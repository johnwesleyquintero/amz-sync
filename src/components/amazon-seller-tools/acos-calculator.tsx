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
import ToolLabel from '../ui/tool-label'; // Import ToolLabel
import { cn } from '@/lib/utils';

// --- Constants ---
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

// --- Component ---

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
        toast({
          title: 'Processing Error',
          description: 'No valid campaign data to process.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const processedData = data.map(campaign => calculateMetrics(campaign));
        setCampaigns(processedData);

        // Format data for charts
        const chartFormatted = processedData.map(c => ({
          name: c.campaign,
          adSpend: c.adSpend,
          sales: c.sales,
          acos: c.acos,
          roas: c.roas,
        }));
        setChartData(chartFormatted);

        toast({
          title: 'Success',
          description: `Processed ${processedData.length} campaign(s)`,
          variant: 'default',
        });
        setError(null);
      } catch (err) {
        const errorMsg = `Failed to process campaign data: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMsg);
        toast({
          title: 'Processing Error',
          description: errorMsg,
          variant: 'destructive',
        });
        setCampaigns([]);
        setChartData(null);
      }
    },
    [toast]
  );

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... (rest of your handleFileUpload function remains the same)
  }, []);

  const handleManualCalculate = () => {
    // ... (rest of your handleManualCalculate function remains the same)
  };

  const clearAllData = () => {
    // ... (rest of your clearAllData function remains the same)
  };

  const handleExport = () => {
    // ... (rest of your handleExport function remains the same)
  };

  // Calculate summary metrics
  const summary = campaigns.reduce(
    (acc, campaign) => {
      // ... (rest of your summary calculation remains the same)
    },
    { totalSpend: 0, totalSales: 0, acosSum: 0, campaignCount: 0, acosCount: 0 }
  );

  const averageAcos = summary.acosCount > 0 ? summary.acosSum / summary.acosCount : 0;
  const overallRoas = summary.totalSpend > 0 ? summary.totalSales / summary.totalSpend : 0;

  const canCalculateOrExport = campaigns.length > 0;

  return (
    <Card>
      <CardHeader>
        <ToolLabel
          title="ACoS & ROAS Calculator"
          description="Analyze Advertising Cost of Sales (ACoS) and Return on Ad Spend (ROAS) for your campaigns."
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Format Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">CSV Format Requirements:</p>
            <p>
              Required columns: <code>{REQUIRED_COLUMNS.join(', ')}</code>. Optional: impressions,
              clicks.
            </p>
            <p className="mt-1">
              Example: <code>campaign,adSpend,sales,impressions,clicks</code>
              <br />
              <code>Summer Sale Auto,125.50,350.00,10000,150</code>
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
              Campaign Data (CSV)
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
