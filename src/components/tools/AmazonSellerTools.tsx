
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Search,
  ClipboardCheck,
  BarChart2,
  FileText,
  Filter,
  PieChart,
  TrendingUp,
  Users,
  LineChart,
  DollarSign,
} from 'lucide-react';

export interface ToolInfo {
  name: string;
  status: 'Active' | 'Beta' | 'Coming Soon';
  version: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  category: 'Analytics' | 'Financial' | 'Content';
}

export const amazonSellerTools: ToolInfo[] = [
  {
    name: "FBA Calculator",
    status: "Active",
    version: "2.0.0",
    description: "Advanced profitability calculator for FBA products with real-time ROI analysis and market trend integration.",
    features: [
      "CSV upload for bulk product analysis",
      "Real-time profit and ROI calculations",
      "Interactive data visualization with Recharts",
      "Manual entry option for single products",
      "Detailed fee breakdown with historical tracking",
      "Advanced error handling and data validation",
      "Market trend analysis integration",
      "Uses shadcn/ui components",
      "Comprehensive data export (CSV, Excel, PDF, JSON)",
      "Responsive design and accessibility compliance"
    ],
    icon: <Calculator className="h-6 w-6" />,
    category: "Financial"
  },
  {
    name: "Keyword Analyzer",
    status: "Active",
    version: "2.1.0",
    description: "Comprehensive keyword research tool with real-time analysis and AI-powered optimization suggestions.",
    features: [
      "CSV Processing with required and optional columns",
      "Auto-trimming and validation of keyword lists",
      "Support for both manual entry and file upload",
      "Async processing via KeywordIntelligence utilities",
      "Search volume visualization using Recharts",
      "Competition level analysis with color-coded badges",
      "AI-powered keyword suggestions",
      "Bulk export (CSV/JSON)",
      "Interactive bar charts for search volume",
      "Mobile-responsive layouts"
    ],
    icon: <Search className="h-6 w-6" />,
    category: "Analytics"
  },
  {
    name: "Listing Quality Checker",
    status: "Active",
    version: "1.5.0",
    description: "AI-powered listing analysis and optimization tool.",
    features: [
      "AI-enhanced title optimization",
      "Smart description analysis",
      "Bullet point optimization",
      "Image requirement validation",
      "Advanced SEO recommendations",
      "ASIN-based competitive analysis",
      "Quality scoring system with benchmarks",
      "Mobile optimization checker",
      "Comprehensive data export",
      "Intuitive navigation"
    ],
    icon: <ClipboardCheck className="h-6 w-6" />,
    category: "Content"
  },
  {
    name: "PPC Campaign Auditor",
    status: "Active",
    version: "2.0.0",
    description: "Advanced PPC campaign performance analysis with AI optimization.",
    features: [
      "Real-time campaign performance metrics",
      "AI-powered bid optimization",
      "Advanced keyword performance analysis",
      "Dynamic ROI tracking",
      "Interactive trend visualization",
      "Automated CSV import/export",
      "Smart performance indicators",
      "Budget optimization suggestions",
      "Interactive charts and graphs",
      "Responsive design"
    ],
    icon: <BarChart2 className="h-6 w-6" />,
    category: "Analytics"
  },
  {
    name: "Description Editor",
    status: "Active",
    version: "1.5.0",
    description: "AI-enhanced rich text editor for Amazon product descriptions.",
    features: [
      "Advanced HTML formatting",
      "Smart keyword integration",
      "Real-time character counter",
      "AI-powered SEO optimization",
      "Live preview mode",
      "Enhanced CSV export",
      "Automated score calculation",
      "Mobile preview mode",
      "Intuitive navigation",
      "Comprehensive data export"
    ],
    icon: <FileText className="h-6 w-6" />,
    category: "Content"
  },
  {
    name: "Keyword Deduplicator",
    status: "Active",
    version: "1.5.0",
    description: "Smart keyword management with AI-powered suggestions.",
    features: [
      "Advanced bulk processing",
      "AI-powered duplicate detection",
      "Smart alternative suggestions",
      "Enhanced export options",
      "Real-time metrics analysis",
      "Performance benchmarking",
      "Trend analysis integration",
      "Interactive charts and graphs",
      "Responsive design"
    ],
    icon: <Filter className="h-6 w-6" />,
    category: "Content"
  },
  {
    name: "ACoS Calculator",
    status: "Active",
    version: "1.5.0",
    description: "Comprehensive advertising analysis with predictive metrics.",
    features: [
      "Advanced campaign tracking",
      "Predictive revenue analysis",
      "Real-time performance metrics",
      "Interactive trend visualization",
      "Automated comparisons",
      "Custom benchmark data",
      "AI-powered recommendations",
      "Budget optimization tools",
      "Comprehensive data export",
      "Intuitive navigation"
    ],
    icon: <PieChart className="h-6 w-6" />,
    category: "Financial"
  },
  {
    name: "Sales Estimator",
    status: "Active",
    version: "1.0.0",
    description: "AI-powered sales prediction tool with market analysis.",
    features: [
      "AI-enhanced category analysis",
      "Advanced competition assessment",
      "Smart revenue projections",
      "Real-time market data integration",
      "Confidence scoring system",
      "Automated CSV processing",
      "Market trend integration",
      "Interactive charts and graphs",
      "Responsive design"
    ],
    icon: <TrendingUp className="h-6 w-6" />,
    category: "Analytics"
  },
  {
    name: "Competitor Analyzer",
    status: "Active",
    version: "1.0.0",
    description: "Comprehensive competitor analysis and tracking tool.",
    features: [
      "Real-time competitor tracking",
      "Price monitoring system",
      "Listing optimization comparison",
      "Market share analysis",
      "Review sentiment analysis",
      "Performance benchmarking",
      "Strategy recommendations",
      "Comprehensive data export",
      "Intuitive navigation"
    ],
    icon: <Users className="h-6 w-6" />,
    category: "Analytics"
  },
  {
    name: "Keyword Trend Analyzer",
    status: "Active",
    version: "1.0.0",
    description: "Advanced keyword trend analysis with predictive insights.",
    features: [
      "Historical trend analysis",
      "Seasonal pattern detection",
      "Market demand forecasting",
      "Competition intensity metrics",
      "Opportunity scoring system",
      "Custom alert system",
      "Trend visualization",
      "Interactive charts and graphs",
      "Responsive design"
    ],
    icon: <LineChart className="h-6 w-6" />,
    category: "Analytics"
  },
  {
    name: "Profit Margin Calculator",
    status: "Active",
    version: "1.0.0",
    description: "Comprehensive profit analysis tool with cost optimization.",
    features: [
      "Dynamic cost calculation",
      "Revenue optimization suggestions",
      "Margin trend analysis",
      "Cost breakdown visualization",
      "Scenario comparison tools",
      "ROI forecasting",
      "Bulk analysis support",
      "Comprehensive data export",
      "Intuitive navigation"
    ],
    icon: <DollarSign className="h-6 w-6" />,
    category: "Financial"
  }
];

interface AmazonSellerToolsProps {
  showCategories?: boolean;
  showTable?: boolean;
  showDetails?: boolean;
  showCTA?: boolean;
  maxTools?: number;
  className?: string;
}

const AmazonSellerTools: React.FC<AmazonSellerToolsProps> = ({
  showCategories = true,
  showTable = true,
  showDetails = true,
  showCTA = true,
  maxTools,
  className = "",
}) => {
  const tools = maxTools ? amazonSellerTools.slice(0, maxTools) : amazonSellerTools;
  
  const analyticTools = tools.filter(tool => tool.category === 'Analytics');
  const financialTools = tools.filter(tool => tool.category === 'Financial');
  const contentTools = tools.filter(tool => tool.category === 'Content');

  return (
    <div className={`space-y-12 ${className}`}>
      {showCategories && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-shakespeare bg-opacity-10 p-8 rounded-xl border border-shakespeare border-opacity-30">
            <div className="flex items-center gap-3">
              <BarChart2 className="h-8 w-8 text-shakespeare" />
              <h2 className="text-2xl font-bold text-shakespeare">Analytics Tools</h2>
            </div>
            <ul className="mt-4 space-y-2">
              {analyticTools.map((tool) => (
                <li key={tool.name} className="flex items-center gap-2">
                  {React.cloneElement(tool.icon as React.ReactElement, { className: "h-4 w-4 text-shakespeare" })}
                  <span>{tool.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-burnt-sienna bg-opacity-10 p-8 rounded-xl border border-burnt-sienna border-opacity-30">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-burnt-sienna" />
              <h2 className="text-2xl font-bold text-burnt-sienna">Financial Calculators</h2>
            </div>
            <ul className="mt-4 space-y-2">
              {financialTools.map((tool) => (
                <li key={tool.name} className="flex items-center gap-2">
                  {React.cloneElement(tool.icon as React.ReactElement, { className: "h-4 w-4 text-burnt-sienna" })}
                  <span>{tool.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gold bg-opacity-10 p-8 rounded-xl border border-gold border-opacity-30">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-gold" />
              <h2 className="text-2xl font-bold text-gold">Content Tools</h2>
            </div>
            <ul className="mt-4 space-y-2">
              {contentTools.map((tool) => (
                <li key={tool.name} className="flex items-center gap-2">
                  {React.cloneElement(tool.icon as React.ReactElement, { className: "h-4 w-4 text-gold" })}
                  <span>{tool.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showTable && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Tool Status Overview</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption className="text-gray-600">Current status of all available tools</TableCaption>
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead className="text-gray-800 font-semibold">Tool</TableHead>
                  <TableHead className="text-gray-800 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-800 font-semibold">Version</TableHead>
                  <TableHead className="text-gray-800 font-semibold">Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.name} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        {tool.icon}
                        {tool.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          tool.status === 'Active' ? "bg-green-600 text-white" : 
                          tool.status === 'Beta' ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
                        }
                      >
                        {tool.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{tool.version}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          tool.category === 'Analytics' ? "border-shakespeare text-shakespeare bg-shakespeare/10" : 
                          tool.category === 'Financial' ? "border-burnt-sienna text-burnt-sienna bg-burnt-sienna/10" : 
                          "border-gold text-gold bg-gold/10"
                        }
                      >
                        {tool.category}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {showDetails && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-shakespeare">Tool Details</h2>
          <Accordion type="single" collapsible className="w-full">
            {tools.map((tool, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-shakespeare/30">
                <AccordionTrigger className="text-xl hover:text-shakespeare">
                  <div className="flex items-center gap-3">
                    {tool.icon}
                    <span>{tool.name}</span>
                    <Badge className="ml-2 bg-green-600">v{tool.version}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-200">
                  <p className="mb-4">{tool.description}</p>
                  <h4 className="font-bold text-shakespeare mb-2">Features:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {tool.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {showCTA && (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-burnt-sienna">Ready to Optimize Your Amazon Business?</h2>
          <p className="text-lg mb-6">Access all these powerful tools with your Amazon Analytics subscription.</p>
          <div className="flex justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="bg-shakespeare hover:bg-shakespeare/90 text-white font-bold">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmazonSellerTools;
