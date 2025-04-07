
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

interface ToolInfo {
  name: string;
  status: 'Active' | 'Beta' | 'Coming Soon';
  version: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  category: 'Analytics' | 'Financial' | 'Content';
}

const Tools = () => {
  const tools: ToolInfo[] = [
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-butterfly-bush to-slate-900 text-white">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white hover:text-burnt-sienna transition-colors">
            Amazon Analytics
          </div>
          <div className="space-x-4">
            <Link to="/dashboard">
              <Button className="bg-shakespeare hover:bg-shakespeare/90 text-white font-bold">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-burnt-sienna">
            Amazon Seller Tools Suite
          </h1>
          <div className="flex justify-center gap-2">
            <Badge className="bg-green-500">Status: Active</Badge>
            <Badge className="bg-blue-500">Version: 2.0</Badge>
          </div>
          <p className="text-lg text-gray-200 leading-relaxed mt-4">
            A comprehensive suite of tools designed to help Amazon sellers optimize their listings, 
            analyze performance, and maximize profitability.
          </p>
        </div>

        {/* Tool Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-shakespeare bg-opacity-10 p-8 rounded-xl border border-shakespeare border-opacity-30">
            <div className="flex items-center gap-3">
              <BarChart2 className="h-8 w-8 text-shakespeare" />
              <h2 className="text-2xl font-bold text-shakespeare">Analytics Tools</h2>
            </div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2">
                <Search className="h-4 w-4 text-shakespeare" />
                <span>Competitor Analyzer</span>
              </li>
              <li className="flex items-center gap-2">
                <Search className="h-4 w-4 text-shakespeare" />
                <span>Keyword Analyzer</span>
              </li>
              <li className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-shakespeare" />
                <span>Keyword Trend Analyzer</span>
              </li>
              <li className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-shakespeare" />
                <span>PPC Campaign Auditor</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-shakespeare" />
                <span>Sales Estimator</span>
              </li>
            </ul>
          </div>

          <div className="bg-burnt-sienna bg-opacity-10 p-8 rounded-xl border border-burnt-sienna border-opacity-30">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-burnt-sienna" />
              <h2 className="text-2xl font-bold text-burnt-sienna">Financial Calculators</h2>
            </div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-burnt-sienna" />
                <span>ACoS Calculator</span>
              </li>
              <li className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-burnt-sienna" />
                <span>FBA Calculator</span>
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-burnt-sienna" />
                <span>Profit Margin Calculator</span>
              </li>
            </ul>
          </div>

          <div className="bg-gold bg-opacity-10 p-8 rounded-xl border border-gold border-opacity-30">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-gold" />
              <h2 className="text-2xl font-bold text-gold">Content Tools</h2>
            </div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold" />
                <span>Description Editor</span>
              </li>
              <li className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gold" />
                <span>Keyword Deduplicator</span>
              </li>
              <li className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-gold" />
                <span>Listing Quality Checker</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tool Status Table */}
        <div className="mb-12 bg-slate-800 bg-opacity-50 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-shakespeare">Tool Status Overview</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Current status of all available tools</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {tool.icon}
                        {tool.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          tool.status === 'Active' ? "bg-green-600" : 
                          tool.status === 'Beta' ? "bg-amber-500" : "bg-blue-600"
                        }
                      >
                        {tool.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{tool.version}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          tool.category === 'Analytics' ? "border-shakespeare text-shakespeare" : 
                          tool.category === 'Financial' ? "border-burnt-sienna text-burnt-sienna" : 
                          "border-gold text-gold"
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

        {/* Tool Details Accordion */}
        <div className="mb-12">
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

        <div className="text-center mb-12">
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
      </main>
    </div>
  );
};

export default Tools;
