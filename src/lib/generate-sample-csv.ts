import Papa from 'papaparse';

// Define a comprehensive interface covering fields needed across various samples
interface SampleData {
  // Common Identifiers
  ASIN?: string;
  SKU?: string;
  product?: string; // General product name (can be derived from Title)
  campaign?: string;
  'Ad Group'?: string;
  'Keyword/Target'?: string; // For PPC
  'Match Type'?: 'Broad' | 'Phrase' | 'Exact' | 'Auto' | 'Targeting'; // For PPC

  // Financials & Costs
  cost?: number; // Cost of Goods
  price?: number; // Sale Price
  fees?: number; // Generic fees (use specific below if possible)
  'FBA Fee Estimate'?: number;
  'Referral Fee Estimate'?: number;
  spend?: number; // Ad Spend $ (can be total or per campaign/keyword)
  adSpend?: number; // Alias for spend
  sales?: number; // Revenue $
  'Ad Spend per Unit'?: number; // For Profit Calc

  // PPC & Advertising Metrics
  impressions?: number;
  clicks?: number;
  ctr?: number; // Click-Through Rate %
  cpc?: number; // Cost Per Click $
  acos?: number; // Advertising Cost of Sales %
  roas?: number; // Return on Ad Spend
  orders?: number; // Attributed orders
  'Conversion Rate'?: number; // %

  // Keyword Metrics
  keywords?: string; // Could be a comma-separated list or single keyword
  searchVolume?: number;
  'Search Volume (Current Month)'?: number; // For Trend
  'Search Volume (Previous Month)'?: number; // For Trend
  'Trend (%)'?: number; // For Trend
  competition?: string | number; // e.g., Low, Medium, High or 0-100
  Difficulty?: number; // Keyword Difficulty (0-100)
  Relevancy?: number; // Keyword Relevancy (0-100)
  'Current Rank'?: number; // Organic or Ad Rank

  // Listing Details
  Title?: string; // Product Title
  description?: string; // Product Description
  'Bullet 1'?: string;
  'Bullet 2'?: string;
  'Bullet 3'?: string;
  'Bullet 4'?: string;
  'Bullet 5'?: string;
  'Backend Keywords'?: string;
  'Title Length'?: number;
  'Bullet Points Count'?: number;
  'Description Length'?: number;
  'Image Count'?: number;
  'Has A+ Content'?: boolean | 'Yes' | 'No';

  // Product & Competitor Details
  Rating?: number; // Average star rating (e.g., 4.5)
  'Review Count'?: number; // Total number of reviews
  BSR?: number; // Best Seller Rank
  Category?: string; // Product Category
  'Seller Type'?: 'FBA' | 'FBM' | 'AMZ'; // Fulfillment method
  'Length (in)'?: number;
  'Width (in)'?: number;
  'Height (in)'?: number;
  'Weight (lb)'?: number;
  'Product Category'?: string; // For FBA Calc (maps to fee tiers)
  'Est. Monthly Units'?: number; // For Profit Calc

  // Other potential fields from original interface (less common now)
  conversion_rate?: number; // Use 'Conversion Rate' instead
  click_through_rate?: number; // Use 'ctr' instead
  market_share?: number;
  product_features?: string;
  brands?: string;
  niche?: string;
  type?: string; // e.g., PPC Campaign Type
  name?: string; // e.g., PPC Campaign Name (use 'campaign'?)

  // Allow flexibility for other potential columns
  [key: string]: unknown;
}

// Updated type to include all specified tools
type SampleDataType =
  | 'competitor-analyzer' // Existing, good
  | 'sales-estimator' // NEW
  | 'keyword-optimization' // NEW (enhances old 'keyword')
  | 'keyword-trend-analyzer' // NEW
  | 'keyword-analyzer' // NEW (can likely reuse optimization data)
  | 'keyword-deduplicator' // Existing, good
  | 'listing-optimization' // NEW
  | 'listing-quality-checker' // NEW
  | 'description-editor' // Existing, good
  | 'acos-calculator' // Existing ('acos' sample is suitable input)
  | 'ppc-campaign-auditor' // NEW (enhances old 'ppc')
  | 'profit-margin-calculator' // NEW (enhances old 'fba')
  | 'fba-calculator' // NEW
  // Keep old ones for reference or potential reuse if needed
  | 'fba'
  | 'keyword'
  | 'ppc'
  | 'acos'
  | 'description'
  | 'seller'
  | 'competitor';

// --- Helper function for Competitor Analyzer Sample Data ---
function createCompetitorAnalyzerSampleData(): SampleData[] {
  // Example: Analyzing Wireless Earbuds
  return [
    // Row 1: Seller's Product
    {
      ASIN: 'B08J4S5T7N', // Example Seller ASIN
      Title: 'AuraSound Pro Wireless Earbuds - Noise Cancelling, 30hr Playtime',
      price: 79.99,
      Rating: 4.4,
      'Review Count': 1520,
      BSR: 580, // Example BSR
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'FBA',
    },
    // Row 2: Competitor 1
    {
      ASIN: 'B07PXV77YQ', // Example Competitor ASIN 1 (e.g., Soundcore)
      Title: 'Anker Soundcore Life P2 True Wireless Earbuds with 4 Mics, CVC 8.0 Noise Reduction',
      price: 49.99,
      Rating: 4.3,
      'Review Count': 185430,
      BSR: 120,
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'FBA',
    },
    // Row 3: Competitor 2
    {
      ASIN: 'B08G4K8CY8', // Example Competitor ASIN 2 (e.g., TOZO)
      Title: 'TOZO T10 Bluetooth 5.3 Wireless Earbuds with Wireless Charging Case IPX8 Waterproof',
      price: 25.99,
      Rating: 4.4,
      'Review Count': 310550,
      BSR: 85,
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'FBA',
    },
    // Row 4: Competitor 3
    {
      ASIN: 'B094N6S3LP', // Example Competitor ASIN 3 (e.g., Beats)
      Title:
        'Beats Studio Buds – True Wireless Noise Cancelling Earbuds – Compatible with Apple & Android',
      price: 99.95,
      Rating: 4.3,
      'Review Count': 88760,
      BSR: 350,
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'AMZ', // Sold by Amazon
    },
    // Row 5: Competitor 4 (Higher End)
    {
      ASIN: 'B09JQS51C1', // Example Competitor ASIN 4 (e.g., Bose)
      Title:
        "Bose QuietComfort Earbuds II, Wireless, Bluetooth, World's Best Noise Cancelling In-Ear Headphones",
      price: 279.0,
      Rating: 4.2,
      'Review Count': 15980,
      BSR: 950,
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'FBA',
    },
  ];
}

export function generateSampleCsv(dataType: string): string {
  // Generate sample data based on the data type
  const data = generateSampleData(dataType);

  // Convert the data to CSV format
  return generateCsvFromData(data);
}

export function generateSampleData(dataType: string): SampleData[] {
  let data: SampleData[] = [];

  switch (dataType) {
    // --- Tools Requiring New/Enhanced Sample Data ---

    case 'sales-estimator':
      // Input data likely used by a sales estimator tool
      data = [
        {
          ASIN: 'B08J4S5T7N',
          Category: 'Electronics > Headphones > Earbud Headphones',
          BSR: 580,
          price: 79.99,
          'Review Count': 1520,
          Rating: 4.4,
        },
        {
          ASIN: 'B07PXV77YQ',
          Category: 'Electronics > Headphones > Earbud Headphones',
          BSR: 120,
          price: 49.99,
          'Review Count': 185430,
          Rating: 4.3,
        },
        {
          ASIN: 'B08G4K8CY8',
          Category: 'Electronics > Headphones > Earbud Headphones',
          BSR: 85,
          price: 25.99,
          'Review Count': 310550,
          Rating: 4.4,
        },
        {
          ASIN: 'B094N6S3LP',
          Category: 'Electronics > Headphones > Earbud Headphones',
          BSR: 350,
          price: 99.95,
          'Review Count': 88760,
          Rating: 4.3,
        },
        {
          ASIN: 'B09JQS51C1',
          Category: 'Electronics > Headphones > Earbud Headphones',
          BSR: 950,
          price: 279.0,
          'Review Count': 15980,
          Rating: 4.2,
        },
        {
          ASIN: 'B07XJ8C8F5',
          Category: 'Home & Kitchen > Kitchen & Dining > Small Appliances',
          BSR: 2100,
          price: 129.99,
          'Review Count': 25000,
          Rating: 4.7,
        },
        {
          ASIN: 'B08H8VZYF5',
          Category: 'Sports & Outdoors > Outdoor Recreation > Camping & Hiking',
          BSR: 550,
          price: 35.5,
          'Review Count': 800,
          Rating: 4.1,
        },
        {
          ASIN: 'B01N0XPBB3',
          Category: 'Toys & Games > Building Toys > Building Sets',
          BSR: 150,
          price: 19.99,
          'Review Count': 45000,
          Rating: 4.8,
        },
      ];
      break;

    case 'keyword-optimization':
    case 'keyword-analyzer': // Reusing the same data for general analysis
      // Data focused on keyword metrics for optimization/analysis
      data = [
        {
          product: 'Organic Facial Cleanser',
          name: 'Sponsored Products - Facial Cleanser',
          type: 'Sponsored Products',
          spend: 150.0,
          sales: 850.0,
          impressions: 10000,
          clicks: 250,
          ctr: 2.5,
          cpc: 0.6,
          acos: 17.65,
        },
        {
          product: 'Vitamin C Serum',
          name: 'Sponsored Products - Vitamin C',
          type: 'Sponsored Products',
          spend: 180.0,
          sales: 950.0,
          impressions: 12000,
          clicks: 300,
          ctr: 2.5,
          cpc: 0.6,
          acos: 18.95,
        },
      ];
      break;

    case 'description': // Same as description-editor
      data = [
        {
          product: 'Organic Facial Cleanser',
          ASIN: 'B01ABCDEF1',
          description:
            'Our organic facial cleanser gently removes impurities and makeup, leaving your skin feeling refreshed and clean. Made with natural ingredients, it is perfect for all skin types.',
        },
        {
          product: 'Vitamin C Serum',
          ASIN: 'B02ABCDEF2',
          description:
            'Brighten and rejuvenate your skin with our Vitamin C Serum. This powerful antioxidant serum helps reduce the appearance of fine lines and wrinkles while improving skin tone and texture.',
        },
      ];
      break;

    case 'ppc-campaign-auditor':
      data = [
        {
          campaign: 'Auto - Bestsellers',
          'Ad Group': 'Auto Targeting',
          'Keyword/Target': 'Auto',
          'Match Type': 'Auto',
          impressions: 15000,
          clicks: 450,
          spend: 225.50,
          sales: 1200.00,
          orders: 48,
          acos: 18.79,
          'Conversion Rate': 10.67,
          ctr: 3.00,
          cpc: 0.50
        },
        {
          campaign: 'Manual - Brand Defense',
          'Ad Group': 'Brand Keywords',
          'Keyword/Target': 'brand name products',
          'Match Type': 'Phrase',
          impressions: 8500,
          clicks: 380,
          spend: 190.00,
          sales: 950.00,
          orders: 38,
          acos: 20.00,
          'Conversion Rate': 10.00,
          ctr: 4.47,
          cpc: 0.50
        },
        {
          campaign: 'Manual - Category',
          'Ad Group': 'Category Keywords',
          'Keyword/Target': 'premium category items',
          'Match Type': 'Broad',
          impressions: 12000,
          clicks: 360,
          spend: 216.00,
          sales: 864.00,
          orders: 36,
          acos: 25.00,
          'Conversion Rate': 10.00,
          ctr: 3.00,
          cpc: 0.60
        }
      ];
      break;

    default:
      console.warn(`Unknown sample data type requested: ${dataType}`);
      data = [];
      break;
  }
  return data;
}

// Generate CSV from data
const generateCsvFromData = (data: SampleData[]): string => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  return Papa.unparse(data, { header: true, columns: headers });
};

// Initialize test data mapping
interface PapaParseResult<T> {
  data: T[];
}

interface TestDataMapping {
  seller: string;
  competitor: string;
  'competitor-analyzer': string;
  'sales-estimator': string;
  'keyword-optimization': string;
  'keyword-trend-analyzer': string;
  'keyword-analyzer': string;
  'keyword-deduplicator': string;
  'listing-optimization': string;
  'listing-quality-checker': string;
  'description-editor': string;
  'acos-calculator': string;
  'ppc-campaign-auditor': string;
  'profit-margin-calculator': string;
  'fba-calculator': string;
  fba: string;
  keyword: string;
  ppc: string;
  acos: string;
  description: string;
}

// Generate sample seller data
const sellerData = Papa.unparse([
  {
    ASIN: 'B08J4S5T7N',
    SKU: 'SELLER-001',
    product: 'Premium Wireless Earbuds',
    price: 79.99,
    cost: 25.0,
    fees: 15.0,
    'FBA Fee Estimate': 5.99,
    'Referral Fee Estimate': 9.01,
    Rating: 4.4,
    'Review Count': 1520,
  },
  {
    ASIN: 'B08H8VZYF5',
    SKU: 'SELLER-002',
    product: 'Camping Backpack',
    price: 35.5,
    cost: 12.0,
    fees: 8.5,
    'FBA Fee Estimate': 4.99,
    'Referral Fee Estimate': 3.51,
    Rating: 4.1,
    'Review Count': 800,
  },
]);

// Generate sample competitor data
const competitorData = Papa.unparse([
  {
    ASIN: 'B07PXV77YQ',
    product: 'Competitor Earbuds A',
    price: 49.99,
    Rating: 4.3,
    'Review Count': 185430,
    BSR: 120,
    'Seller Type': 'FBA',
  },
  {
    ASIN: 'B08G4K8CY8',
    product: 'Competitor Earbuds B',
    price: 25.99,
    Rating: 4.4,
    'Review Count': 310550,
    BSR: 85,
    'Seller Type': 'FBA',
  },
]);

const testDataMapping: TestDataMapping = {
  seller: sellerData,
  competitor: competitorData,
  'competitor-analyzer': generateCsvFromData(createCompetitorAnalyzerSampleData()),
  'sales-estimator': generateCsvFromData(generateSampleData('sales-estimator')),
  'keyword-optimization': generateCsvFromData(generateSampleData('keyword-optimization')),
  'keyword-trend-analyzer': generateCsvFromData(generateSampleData('keyword-trend-analyzer')),
  'keyword-analyzer': generateCsvFromData(generateSampleData('keyword-analyzer')),
  'keyword-deduplicator': generateCsvFromData(generateSampleData('keyword-deduplicator')),
  'listing-optimization': generateCsvFromData(generateSampleData('listing-optimization')),
  'listing-quality-checker': generateCsvFromData(generateSampleData('listing-quality-checker')),
  'description-editor': generateCsvFromData(generateSampleData('description')),
  'acos-calculator': generateCsvFromData(generateSampleData('acos')),
  'ppc-campaign-auditor': generateCsvFromData(generateSampleData('ppc-campaign-auditor')),
  'profit-margin-calculator': generateCsvFromData(generateSampleData('profit-margin-calculator')),
  'fba-calculator': generateCsvFromData(generateSampleData('fba')),
  fba: generateCsvFromData(generateSampleData('fba')),
  keyword: generateCsvFromData(generateSampleData('keyword')),
  ppc: generateCsvFromData(generateSampleData('ppc')),
  acos: generateCsvFromData(generateSampleData('acos')),
  description: generateCsvFromData(generateSampleData('description')),
};

export function downloadSampleCsv(dataType: SampleDataType, fileName?: string): void {
  const csvData = testDataMapping[dataType];
  if (!csvData) {
    throw new Error(`No sample data available for type: ${dataType}`);
  }
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  // Use a more descriptive default filename
  link.setAttribute('download', fileName || `sample-${dataType}-data.csv`);
  document.body.appendChild(link);
  link.click();

  // Clean up: Revoke the object URL and remove the link
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100); // Delay cleanup slightly
}
