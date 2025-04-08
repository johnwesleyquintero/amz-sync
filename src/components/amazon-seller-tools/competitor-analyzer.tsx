'use client';

import { useState, useCallback, useEffect } from 'react';
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
} from 'recharts';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info, FileText } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { ProcessedRow, ChartDataPoint } from '@/lib/amazon-types';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { BatchProcessor, ProcessingResult } from '@/lib/enhanced-csv-utils';
import { ProcessedRow } from '@/lib/amazon-types';

// Constants
const COMPETITOR_ANALYSIS_ENDPOINT = '/api/amazon/competitor-analysis';
const COMPETITOR_ANALYSES_KEY = 'competitorAnalyses';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_SAVED_ANALYSES = 10;

type MetricType =
  | 'price'
  | 'reviews'
  | 'rating'
  | 'sales_velocity'
  | 'inventory_levels'
  | 'conversion_rate'
  | 'click_through_rate';

const getChartColor = (metric: MetricType): string => {
  switch (metric) {
    case 'price':
      return '#8884d8';
    case 'reviews':
      return '#82ca9d';
    case 'rating':
      return '#ffc658';
    case 'sales_velocity':
      return '#a4de6c';
    case 'inventory_levels':
      return '#d0ed57';
    case 'conversion_rate':
      return '#cc79cd';
    case 'click_through_rate':
      return '#7ac5d8';
    default:
      return '#000000';
  }
};

interface ApiResponse {
  competitors: string[];
  metrics: Record<MetricType, number[]>;
}

export default function CompetitorAnalyzer() {
  const { toast } = useToast();
  const [asin, setAsin] = useState('');
  const [metrics, setMetrics] = useState<MetricType[]>(['price', 'reviews', 'rating']);
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [sellerData, setSellerData] = useState<ProcessedRow | null>(null);
  const [competitorData, setCompetitorData] = useState<ProcessedRow[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (chartData) {
      setSelectedMetrics(metrics);
    }
  }, [chartData, metrics]);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, type: 'seller' | 'competitor') => {
      const file = event.target.files?.[0];
      if (!file) {
        toast({
          title: 'Error',
          description: 'Please select a file',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      try {
        const batchProcessor = new BatchProcessor<ProcessedRow>();
        const result = await batchProcessor.processFile(file, (progress) => {
          // You could add a progress indicator here if needed
        });

        if (result.errors.length > 0) {
          console.warn('Some rows had errors:', result.errors);
        }

        if (type === 'seller') {
          setSellerData(result.data[0]); // We only need the first row for seller data
        } else {
          setCompetitorData(result.data);
        }

        toast({
          title: 'Success',
          description: `${type} data processed successfully`,
          variant: 'default',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to process ${type} CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const analyzeCompetitor = async () => {
    if (!sellerData || !competitorData.length) {
      toast({
        title: 'Error',
        description: 'Please upload both seller and competitor data files',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Format competitor data for chart display
      const formattedData = competitorData.map((row) => {
        const competitor = row.asin || 'N/A';
        const dataPoint: ChartDataPoint = {
          name: competitor,
        };

        // Add metrics data with proper type conversion
        metrics.forEach(metric => {
          let value = row[metric as keyof ProcessedRow];
          if (value !== undefined && value !== null) {
            // Convert string values to numbers and handle invalid values
            const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
            if (!isNaN(numValue)) {
              dataPoint[metric] = numValue;
            }
          }
        });

        return dataPoint;
      });

      // Add seller data as first point for comparison
      const sellerPoint: ChartDataPoint = {
        name: sellerData.asin || 'Your Product',
      };

      metrics.forEach(metric => {
        let value = sellerData[metric as keyof ProcessedRow];
        if (value !== undefined && value !== null) {
          // Convert string values to numbers and handle invalid values
          const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
          if (!isNaN(numValue)) {
            sellerPoint[metric] = numValue;
          }
        }
      });

      formattedData.unshift(sellerPoint);

      if (formattedData.length > 0) {
        setChartData(formattedData);
      } else {
        throw new Error('No data available to render');
      }

      setIsAnalyzing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze data',
        variant: 'destructive',
      });
      setChartData(null);
      setIsAnalyzing(false);
    }
  };

  const isMobile = useIsMobile();

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Competitor Analyzer</CardTitle>
        <CardDescription>Upload your data or enter an ASIN to analyze competitors.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="seller-csv">Seller Data CSV</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Upload a CSV with columns: asin, price, reviews, rating, conversion_rate,
                      click_through_rate, brands, keywords, niche
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Input
                id="seller-csv"
                type="file"
                accept=".csv"
                onChange={e => handleFileUpload(e, 'seller')}
                className="cursor-pointer"
              />
              <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="competitor-csv">Competitor Data CSV</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Upload a CSV with columns: asin, price, reviews, rating, conversion_rate,
                      click_through_rate, brands, keywords, niche
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Input
                id="competitor-csv"
                type="file"
                accept=".csv"
                onChange={e => handleFileUpload(e, 'competitor')}
                className="cursor-pointer"
              />
              <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="asin">Or Enter Competitor ASIN</Label>
          <Input
            id="asin"
            value={asin}
            onChange={e => setAsin(e.target.value)}
            placeholder="Enter competitor ASIN or niche"
          />
        </div>

        <div>
          <Label htmlFor="metrics">Metrics to Compare</Label>
          <div className="flex flex-col gap-2">
            {[
              'price',
              'reviews',
              'rating',
              'sales_velocity',
              'inventory_levels',
              'conversion_rate',
              'click_through_rate',
            ].map(metric => (
              <div key={metric} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={metric}
                  checked={metrics.includes(metric)}
                  onChange={e => {
                    if (e.target.checked) {
                      setMetrics([...metrics, metric]);
                    } else {
                      setMetrics(metrics.filter(m => m !== metric));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor={metric}>
                  {metric
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={analyzeCompetitor} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <Progress value={50} className="h-4 w-16" />
                Analyzing...
              </div>
            ) : (
              'Analyze Competitor'
            )}
          </Button>
          <Button
            variant="outline"
            disabled={!chartData}
            onClick={() => {
              // Save analysis results to localStorage
              const timestamp = new Date().toISOString();
              const savedAnalyses = JSON.parse(localStorage.getItem('competitorAnalyses') || '[]');
              savedAnalyses.push({
                id: timestamp,
                date: new Date().toLocaleString(),
                asin,
                metrics,
                chartData,
              });
              localStorage.setItem('competitorAnalyses', JSON.stringify(savedAnalyses));
              toast({
                title: 'Success',
                description: 'Analysis saved for future reference',
                variant: 'default',
              });
            }}
          >
            Save Analysis
          </Button>
        </div>

        {chartData ? (
          <div className="mt-4 h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={isMobile ? 45 : 0}
                  textAnchor={isMobile ? 'start' : 'middle'}
                  tick={{ fontSize: isMobile ? 10 : 14 }}
                />
                <YAxis />
                <RechartsTooltip />
                <Legend wrapperStyle={{ paddingTop: 20 }} />
                {selectedMetrics.map(metric => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={getChartColor(metric)}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
