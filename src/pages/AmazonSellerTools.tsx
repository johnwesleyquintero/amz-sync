'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '@/components/ui/button'; // Import Button for sidebar navigation
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
  Calculator,
  Search,
  CheckSquare,
  TrendingUp,
  FileText,
  Filter,
  DollarSign,
  BarChart3,
  Users,
  LineChart,
  Percent,
  Package,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Define the list of available tools (Ensure icons have consistent styling)
const ALL_TOOLS: Tool[] = [
  {
    id: 'competitor-analyzer',
    name: 'Competitor Analyzer',
    description: 'Analyze competitor listings, pricing strategies, and market positioning',
    icon: <Users className="h-4 w-4 flex-shrink-0" />, // Consistent icon size
    status: 'beta',
    version: '0.9.0',
    component: <CompetitorAnalyzer />,
    category: 'Market Analysis',
  },
  {
    id: 'sales-estimator',
    name: 'Sales Estimator',
    description: 'Sales volume and revenue estimation tool with confidence indicators',
    icon: <BarChart3 className="h-4 w-4 flex-shrink-0" />,
    status: 'beta',
    version: '0.8.0',
    component: <SalesEstimator />,
    category: 'Market Analysis',
  },
  {
    id: 'keyword-trend-analyzer',
    name: 'Keyword Trend Analyzer',
    description: 'Track and analyze keyword performance trends over time',
    icon: <LineChart className="h-4 w-4 flex-shrink-0" />,
    status: 'active',
    version: '1.0.0',
    component: <KeywordTrendAnalyzer />,
    category: 'Keyword Optimization',
  },
  {
    id: 'keyword-analyzer',
    name: 'Keyword Analyzer',
    description: 'Advanced keyword research and optimization tool',
    icon: <Search className="h-4 w-4 flex-shrink-0" />,
    status: 'active',
    version: '1.1.0',
    component: <KeywordAnalyzer />,
    category: 'Keyword Optimization',
  },
  {
    id: 'keyword-deduplicator',
    name: 'Keyword Deduplicator',
    description: 'Identifies and removes duplicate keywords with enhanced metrics',
    icon: <Filter className="h-4 w-4 flex-shrink-0" />,
    status: 'active',
    version: '1.0.0',
    component: <KeywordDeduplicator />,
    category: 'Keyword Optimization',
  },
  {
    id: 'profit-margin-calculator',
    name: 'Profit Margin Calculator',
    description: 'Calculate and analyze profit margins with detailed breakdowns',
    icon: <Percent className="h-4 w-4 flex-shrink-0" />,
    status: 'active',
    version: '1.0.0',
    component: <ProfitMarginCalculator />,
    category: 'Financial Analysis',
  },
  {
    id: 'fba-calculator',
    name: 'FBA Calculator',
    description: 'Calculate profitability for FBA products with real-time ROI analysis',
    icon: <Package className="h-4 w-4 flex-shrink-0" />,
    status: 'active',
    version: '1.0.0',
    component: <FbaCalculator />,
    category: 'Financial Analysis',
  },
  {
    id: 'acos-calculator',
    name: 'ACoS Calculator',
    description: 'Advertising Cost of Sales analysis tool with advanced metrics',
    icon: <DollarSign className="h-4 w-4 flex-shrink-0" />,
    status: 'active',
    version: '1.0.0',
    component: <AcosCalculator />,
    category: 'PPC Management',
  },
  {
    id: 'ppc-campaign-auditor',
    name: 'PPC Campaign Auditor',
    description: 'PPC campaign performance analysis and optimization',
    icon: <TrendingUp className="h-4 w-4 flex-shrink-0" />,
    status: 'active',
    version: '1.2.0',
    component: <PpcCampaignAuditor />,
    category: 'PPC Management',
  },
  {
    id: 'listing-quality-checker',
    name: 'Listing Quality Checker',
    description: 'Comprehensive listing analysis and optimization tool',
    icon: <CheckSquare className="h-4 w-4 flex-shrink-0" />,
    status: 'beta',
    version: '0.9.0',
    component: <ListingQualityChecker />,
    category: 'Listing Optimization',
  },
  {
    id: 'description-editor',
    name: 'Description Editor',
    description: 'Rich text editor for Amazon product descriptions',
    icon: <FileText className="h-4 w-4 flex-shrink-0" />,
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
  'Listing Optimization',
  'PPC Management',
  'Financial Analysis',
];

/**
 * AmazonSellerTools Component
 * Renders a page showcasing various tools for Amazon sellers, organized by category.
 * Features a sidebar for navigation and a main content area to display the selected tool.
 */
export default function AmazonSellerTools() {
  // Set the default active tool to the first tool in the list
  const [activeToolId, setActiveToolId] = useState<string>(ALL_TOOLS[0].id);

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
  const activeTool = useMemo(
    () => ALL_TOOLS.find(tool => tool.id === activeToolId),
    [activeToolId]
  );

  return (
    <section
      id="tools"
      className="py-12 md:py-16 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-slate-950" // Consistent background gradient
    >
      <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
        <div className="mb-8 md:mb-12 text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl flex items-center justify-center gap-2 text-gray-900 dark:text-gray-100">
            <Wrench className="h-7 w-7 text-primary" /> Amazon Seller Tools
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
            A comprehensive suite of specialized tools designed to help you analyze data, optimize
            listings, manage PPC, and maximize profitability on Amazon.
          </p>
        </div>

        {/* Main Layout: Sidebar + Content Area */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
            {/* Sticky container for the sidebar content */}
            <div className="sticky top-20 space-y-6 p-4 bg-card rounded-lg shadow-sm border dark:border-border">
              {' '}
              {/* Consistent card styling */}
              {categories.map(category => (
                <div key={category}>
                  {/* Category Title */}
                  <h3 className="mb-3 px-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {category}
                  </h3>
                  {/* Tool Buttons within Category */}
                  <div className="space-y-1">
                    {categorizedTools[category].map(tool => (
                      <Button
                        key={tool.id}
                        variant="ghost" // Ghost variant for subtle sidebar items
                        onClick={() => setActiveToolId(tool.id)}
                        className={cn(
                          'w-full justify-start items-center gap-3 px-3 py-2 text-sm font-medium h-auto rounded-md', // Base styles
                          activeToolId === tool.id
                            ? 'bg-primary/10 text-primary dark:bg-primary/20' // Active state styling (matches Sidebar.tsx)
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground' // Default/hover state (matches Sidebar.tsx)
                        )}
                      >
                        {/* Icon wrapper */}
                        <span className={cn(activeToolId === tool.id ? 'text-primary' : '')}>
                          {tool.icon}
                        </span>
                        {/* Tool Name (truncated if long) */}
                        <span className="flex-1 text-left truncate">{tool.name}</span>
                        {/* Beta Badge (if applicable) */}
                        {tool.status === 'beta' && (
                          <Badge
                            variant="secondary" // Subtle badge variant
                            className="ml-auto px-1.5 py-0.5 text-xs scale-90 rounded-sm font-normal" // Small, rounded badge
                          >
                            Beta
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            {/* Render the active tool's component */}
            {/* The individual tool components already contain their own <Card> wrapper */}
            {activeTool ? (
              activeTool.component
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  Select a tool from the sidebar to get started.
                </CardContent>
              </Card>
            )}

            {/* Footer Section (Provides context about the tools) */}
            <div className="mt-8 p-6 bg-muted/50 dark:bg-muted/30 rounded-lg border dark:border-border">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2 text-foreground dark:text-gray-200">
                  About These Tools:
                </p>
                <p>
                  This suite helps Amazon sellers optimize listings, analyze performance, and
                  maximize profitability. Most tools support CSV uploads for bulk processing and
                  provide detailed analysis with actionable insights.
                </p>
                <p className="mt-2">
                  Use the{' '}
                  <Badge variant="outline" size="sm" className="px-1.5 py-0.5 text-xs">
                    Sample
                  </Badge>{' '}
                  buttons within each tool to download example CSV files and understand the required
                  format. You can upload your own data or use manual entry options where available.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
