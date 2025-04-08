'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../components/ui/badge';
import FbaCalculator from '../components/amazon-seller-tools/fba-calculator';
import KeywordAnalyzer from '../components/amazon-seller-tools/keyword-analyzer';
import ListingQualityChecker from '../components/amazon-seller-tools/listing-quality-checker';
import PpcCampaignAuditor from '../components/amazon-seller-tools/ppc-campaign-auditor';
import DescriptionEditor from '../components/amazon-seller-tools/description-editor';
import KeywordDeduplicator from '../components/amazon-seller-tools/keyword-deduplicator';
import AcosCalculator from '../components/amazon-seller-tools/acos-calculator';
import SalesEstimator from '../components/amazon-seller-tools/sales-estimator';
import CompetitorAnalyzer from '../components/amazon-seller-tools/competitor-analyzer';
import KeywordTrendAnalyzer from '../components/amazon-seller-tools/keyword-trend-analyzer';
import ProfitMarginCalculator from '../components/amazon-seller-tools/profit-margin-calculator';
import {
  Calculator, // Used by FbaCalculator (implicitly)
  Search, // Used by KeywordAnalyzer
  CheckSquare, // Used by ListingQualityChecker
  TrendingUp, // Used by PpcCampaignAuditor
  FileText, // Used by DescriptionEditor
  Filter, // Used by KeywordDeduplicator
  DollarSign, // Used by AcosCalculator
  BarChart3, // Used by SalesEstimator
  Users, // Used by CompetitorAnalyzer
  LineChart, // Used by KeywordTrendAnalyzer
  Percent, // Used by ProfitMarginCalculator
  Package, // Used by FbaCalculator
  Wrench, // Icon for the overall section title
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn utility

// Define the structure for a tool
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'beta';
  version: string;
  component: React.ReactNode;
  category: string;
}

// Define the list of available tools
const ALL_TOOLS: Tool[] = [
  {
    id: 'competitor-analyzer',
    name: 'Competitor Analyzer',
    description: 'Analyze competitor listings, pricing strategies, and market positioning',
    icon: <Users className="h-5 w-5 flex-shrink-0" />,
    status: 'beta',
    version: '0.9.0',
    component: <CompetitorAnalyzer />,
    category: 'Market Analysis',
  },
  {
    id: 'sales-estimator',
    name: 'Sales Estimator',
    description: 'Sales volume and revenue estimation tool with confidence indicators',
    icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />,
    status: 'beta',
    version: '0.8.0',
    component: <SalesEstimator />,
    category: 'Market Analysis',
  },
  {
    id: 'keyword-trend-analyzer',
    name: 'Keyword Trend Analyzer',
    description: 'Track and analyze keyword performance trends over time',
    icon: <LineChart className="h-5 w-5 flex-shrink-0" />,
    status: 'active',
    version: '1.0.0',
    component: <KeywordTrendAnalyzer />,
    category: 'Keyword Optimization',
  },
  {
    id: 'keyword-analyzer',
    name: 'Keyword Analyzer',
    description: 'Advanced keyword research and optimization tool',
    icon: <Search className="h-5 w-5 flex-shrink-0" />,
    status: 'active',
    version: '1.1.0',
    component: <KeywordAnalyzer />,
    category: 'Keyword Optimization',
  },
  {
    id: 'keyword-deduplicator',
    name: 'Keyword Deduplicator',
    description: 'Identifies and removes duplicate keywords with enhanced metrics',
    icon: <Filter className="h-5 w-5 flex-shrink-0" />,
    status: 'active',
    version: '1.0.0',
    component: <KeywordDeduplicator />,
    category: 'Keyword Optimization',
  },
  {
    id: 'profit-margin-calculator',
    name: 'Profit Margin Calculator',
    description: 'Calculate and analyze profit margins with detailed breakdowns',
    icon: <Percent className="h-5 w-5 flex-shrink-0" />,
    status: 'active',
    version: '1.0.0',
    component: <ProfitMarginCalculator />,
    category: 'Financial Analysis',
  },
  {
    id: 'fba-calculator',
    name: 'FBA Calculator',
    description: 'Calculate profitability for FBA products with real-time ROI analysis',
    icon: <Package className="h-5 w-5 flex-shrink-0" />,
    status: 'active',
    version: '1.0.0',
    component: <FbaCalculator />,
    category: 'Financial Analysis',
  },
  {
    id: 'acos-calculator',
    name: 'ACoS Calculator',
    description: 'Advertising Cost of Sales analysis tool with advanced metrics',
    icon: <DollarSign className="h-5 w-5 flex-shrink-0" />,
    status: 'active',
    version: '1.0.0',
    component: <AcosCalculator />,
    category: 'PPC Management',
  },
  {
    id: 'ppc-campaign-auditor',
    name: 'PPC Campaign Auditor',
    description: 'PPC campaign performance analysis and optimization',
    icon: <TrendingUp className="h-5 w-5 flex-shrink-0" />,
    status: 'active',
    version: '1.2.0',
    component: <PpcCampaignAuditor />,
    category: 'PPC Management',
  },
  {
    id: 'listing-quality-checker',
    name: 'Listing Quality Checker',
    description: 'Comprehensive listing analysis and optimization tool',
    icon: <CheckSquare className="h-5 w-5 flex-shrink-0" />,
    status: 'beta',
    version: '0.9.0',
    component: <ListingQualityChecker />,
    category: 'Listing Optimization',
  },
  {
    id: 'description-editor',
    name: 'Description Editor',
    description: 'Rich text editor for Amazon product descriptions',
    icon: <FileText className="h-5 w-5 flex-shrink-0" />,
    status: 'active',
    version: '1.0.1',
    component: <DescriptionEditor />,
    category: 'Listing Optimization',
  },
];

// Define the order of categories for display
const CATEGORY_ORDER: string[] = [
  'Market Analysis',
  'Keyword Optimization',
  'Financial Analysis',
  'PPC Management',
  'Listing Optimization',
];

export default function AmazonSellerTools() {
  // Set the default active tab to the first tool in the list
  const [activeTab, setActiveTab] = useState<string>(ALL_TOOLS[0].id);

  // Memoize the categorized tools to avoid recalculating on every render
  const categorizedTools = useMemo(() => {
    const grouped = ALL_TOOLS.reduce(
      (acc, tool) => {
        if (!acc[tool.category]) {
          acc[tool.category] = [];
        }
        acc[tool.category].push(tool);
        return acc;
      },
      {} as { [key: string]: Tool[] }
    );

    // Ensure categories follow the defined order
    const orderedGrouped: { [key: string]: Tool[] } = {};
    CATEGORY_ORDER.forEach(category => {
      if (grouped[category]) {
        orderedGrouped[category] = grouped[category];
      }
    });
    // Add any categories not in CATEGORY_ORDER at the end
    Object.keys(grouped).forEach(category => {
      if (!orderedGrouped[category]) {
        orderedGrouped[category] = grouped[category];
      }
    });
    return orderedGrouped;
  }, []); // Empty dependency array means this runs only once

  const categories = Object.keys(categorizedTools);

  return (
    <section
      id="tools"
      // Consistent background gradient/color
      className="py-12 md:py-16 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-slate-900"
    >
      <div className="container px-4 md:px-6">
        {/* Consistent Section Header */}
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl flex items-center justify-center gap-2">
            <Wrench className="h-7 w-7 text-primary" /> Amazon Seller Tools
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive suite of specialized tools designed to help you analyze data, optimize listings, manage PPC, and maximize profitability on Amazon.
          </p>
        </div>

        {/* Main Container Card - applying consistent styling */}
        <Card className="overflow-hidden shadow-lg"> {/* Removed border, added overflow-hidden */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation Area - styled consistently */}
            <div className="bg-muted/30 dark:bg-muted/20 p-4 md:p-6 border-b">
              <TabsList className="h-auto flex flex-wrap justify-center gap-x-3 gap-y-4 bg-transparent p-0">
                {categories.map(category => (
                  <div key={category} className="w-full md:w-auto flex flex-col items-center">
                    {/* Category Title */}
                    <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider w-full text-center md:text-left px-1">
                      {category}
                    </h3>
                    {/* Tool Buttons within Category */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      {categorizedTools[category].map(tool => (
                        <TabsTrigger
                          key={tool.id}
                          value={tool.id}
                          // Consistent button styling for tabs
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 text-sm h-auto rounded-md border border-transparent",
                            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
                            "hover:bg-muted hover:text-foreground transition-colors duration-200"
                          )}
                        >
                          {tool.icon}
                          <span>{tool.name}</span>
                          {tool.status === 'beta' && (
                            <Badge
                              variant="secondary"
                              className="ml-1 px-1.5 py-0.5 text-xs scale-90 rounded-sm" // Slightly smaller badge
                            >
                              Beta
                            </Badge>
                          )}
                        </TabsTrigger>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsList>
            </div>

            {/* Tab Content Area - consistent padding */}
            <div className="p-4 md:p-6 lg:p-8"> {/* Added slightly more padding */}
              {ALL_TOOLS.map(tool => (
                <TabsContent key={tool.id} value={tool.id} className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                  {/* Inner card structure removed to let the tool component define its own card */}
                  {/* The tool component itself should be wrapped in <Card>...</Card> */}
                  {tool.component}
                </TabsContent>
              ))}
            </div>
          </Tabs>

          {/* Footer Section - consistent styling */}
          <div className="p-6 bg-muted/50 dark:bg-muted/30 border-t">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">About These Tools:</p>
              <p>
                This suite helps Amazon sellers optimize listings, analyze performance, and maximize profitability. Most tools support CSV uploads for bulk processing and provide detailed analysis with actionable insights.
              </p>
              <p className="mt-2">
                Use the <Badge variant="outline" size="sm" className="px-1.5 py-0.5 text-xs">Sample</Badge> buttons to download example CSV files and understand the required format. You can upload your own data or use manual entry options where available.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
