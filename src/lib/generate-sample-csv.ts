import Papa from 'papaparse';

// Define a comprehensive interface covering fields needed across various samples
// Added comments for clarity on some fields
interface SampleData {
  // Common Identifiers
  ASIN?: string;
  SKU?: string;
  product?: string; // General product name (can be derived from Title)
  campaign?: string; // Campaign Name
  'Ad Group'?: string; // Ad Group Name
  'Keyword/Target'?: string; // Specific keyword or targeting entity
  'Match Type'?: 'Broad' | 'Phrase' | 'Exact' | 'Auto' | 'Targeting'; // PPC Match Type

  // Financials & Costs
  cost?: number; // Cost of Goods Sold (COGS)
  price?: number; // Selling Price
  fees?: number; // Generic total fees (less specific)
  'FBA Fee Estimate'?: number; // Estimated FBA fulfillment fee
  'Referral Fee Estimate'?: number; // Estimated Amazon referral fee
  spend?: number; // Ad Spend ($)
  adSpend?: number; // Alias for spend ($)
  sales?: number; // Total Sales Revenue ($)
  'Ad Spend per Unit'?: number; // Calculated Ad Spend / Units Sold

  // PPC & Advertising Metrics
  impressions?: number; // Number of times ad was shown
  clicks?: number; // Number of times ad was clicked
  ctr?: number; // Click-Through Rate (%)
  cpc?: number; // Cost Per Click ($)
  acos?: number; // Advertising Cost of Sales (%)
  roas?: number; // Return on Ad Spend (Sales / Spend)
  orders?: number; // Number of orders attributed to ads
  'Conversion Rate'?: number; // Conversion Rate (%) (Orders / Clicks)

  // Keyword Metrics
  keywords?: string; // The keyword being analyzed
  searchVolume?: number; // Estimated monthly search volume
  'Search Volume (Current Month)'?: number; // SV for the current period
  'Search Volume (Previous Month)'?: number; // SV for the previous period
  'Trend (%)'?: number; // Percentage change in SV
  competition?: string | number; // Competition level (e.g., Low, Medium, High or 0-100)
  Difficulty?: number; // Keyword Difficulty score (0-100)
  Relevancy?: number; // Keyword Relevancy score (0-100)
  'Current Rank'?: number; // Organic or Ad Rank for the keyword

  // Listing Details
  Title?: string; // Product Title
  description?: string; // Product Description
  'Bullet 1'?: string;
  'Bullet 2'?: string;
  'Bullet 3'?: string;
  'Bullet 4'?: string;
  'Bullet 5'?: string;
  'Backend Keywords'?: string; // Search terms in the backend
  'Title Length'?: number; // Character count of the title
  'Bullet Points Count'?: number; // Number of bullet points used
  'Description Length'?: number; // Character count of the description
  'Image Count'?: number; // Number of product images
  'Has A+ Content'?: boolean | 'Yes' | 'No'; // Presence of A+ Content

  // Product & Competitor Details
  Rating?: number; // Average star rating (e.g., 4.5)
  'Review Count'?: number; // Total number of reviews
  BSR?: number; // Best Seller Rank (numeric)
  Category?: string; // Product Category path
  'Seller Type'?: 'FBA' | 'FBM' | 'AMZ'; // Fulfillment method
  'Length (in)'?: number; // Product dimension
  'Width (in)'?: number; // Product dimension
  'Height (in)'?: number; // Product dimension
  'Weight (lb)'?: number; // Product weight
  'Product Category'?: string; // Simplified category for FBA Calc (maps to fee tiers)
  'Est. Monthly Units'?: number; // Estimated units sold per month

  // Allow flexibility for other potential columns not explicitly defined
  [key: string]: unknown;
}

// --- Refined Sample Data Types ---
// Using more descriptive names aligned with tool functions
// Removed older, potentially redundant types (fba, keyword, ppc, acos, description, seller, competitor)
// Mapped similar concepts (e.g., description -> description-editor)
export type SampleDataType =
  | 'competitor-analyzer'
  | 'sales-estimator'
  | 'keyword-optimization' // Covers keyword analysis, trends, general keyword data
  | 'keyword-deduplicator' // Requires a list of keywords, potentially with campaign/ad group context
  | 'listing-optimization' // Covers listing quality checks as well
  | 'description-editor'
  | 'acos-calculator' // Requires campaign/ad group level spend/sales data
  | 'ppc-campaign-auditor' // Requires detailed PPC performance data
  | 'profit-margin-calculator' // Requires cost, price, fees, potentially ad spend per unit
  | 'fba-calculator'; // Requires dimensions, weight, category, price

// --- Helper Functions for Generating Specific Sample Data ---

/** Generates sample data for Competitor Analyzer tool */
function createCompetitorAnalyzerSampleData(): SampleData[] {
  // Scenario: Analyzing Wireless Earbuds market
  return [
    {
      // Your Product
      ASIN: 'B08J4S5T7N',
      Title: 'AuraSound Pro Wireless Earbuds - Noise Cancelling, 30hr Playtime',
      price: 79.99,
      Rating: 4.4,
      'Review Count': 1520,
      BSR: 580,
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'FBA',
      'Has A+ Content': 'Yes',
      'Image Count': 7,
    },
    {
      // Competitor 1 (Mid-Range, High Volume)
      ASIN: 'B07PXV77YQ',
      Title: 'Anker Soundcore Life P2 True Wireless Earbuds with 4 Mics, CVC 8.0 Noise Reduction',
      price: 49.99,
      Rating: 4.3,
      'Review Count': 185430,
      BSR: 120,
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'FBA',
      'Has A+ Content': 'Yes',
      'Image Count': 6,
    },
    {
      // Competitor 2 (Budget, Very High Volume)
      ASIN: 'B08G4K8CY8',
      Title: 'TOZO T10 Bluetooth 5.3 Wireless Earbuds with Wireless Charging Case IPX8 Waterproof',
      price: 25.99,
      Rating: 4.4,
      'Review Count': 310550,
      BSR: 85,
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'FBA',
      'Has A+ Content': 'No',
      'Image Count': 5,
    },
    {
      // Competitor 3 (Premium Brand)
      ASIN: 'B094N6S3LP',
      Title:
        'Beats Studio Buds – True Wireless Noise Cancelling Earbuds – Compatible with Apple & Android',
      price: 99.95,
      Rating: 4.3,
      'Review Count': 88760,
      BSR: 350,
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'AMZ', // Sold by Amazon
      'Has A+ Content': 'Yes',
      'Image Count': 8,
    },
    {
      // Competitor 4 (High-End Niche)
      ASIN: 'B09JQS51C1',
      Title:
        "Bose QuietComfort Earbuds II, Wireless, Bluetooth, World's Best Noise Cancelling In-Ear Headphones",
      price: 279.0,
      Rating: 4.2,
      'Review Count': 15980,
      BSR: 950,
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'FBA',
      'Has A+ Content': 'Yes',
      'Image Count': 7,
    },
  ];
}

/** Generates sample data for Sales Estimator tool */
function createSalesEstimatorSampleData(): SampleData[] {
  // Input typically includes BSR, Category, Price, Reviews, Rating
  return [
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
      ASIN: 'B07XJ8C8F5',
      Category: 'Home & Kitchen > Kitchen & Dining > Small Appliances > Coffee Machines',
      BSR: 2100,
      price: 129.99,
      'Review Count': 25000,
      Rating: 4.7,
    },
    {
      ASIN: 'B08H8VZYF5',
      Category: 'Sports & Outdoors > Outdoor Recreation > Camping & Hiking > Tents',
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
    {
      ASIN: 'B09XYZABCD',
      Category: 'Beauty & Personal Care > Skincare > Face > Cleansers',
      BSR: 1250,
      price: 15.95,
      'Review Count': 3200,
      Rating: 4.6,
    },
  ];
}

/** Generates sample data for Keyword Optimization/Analysis tools */
function createKeywordOptimizationSampleData(): SampleData[] {
  // Includes search volume, trend, competition, difficulty, relevancy, and optionally PPC metrics
  return [
    {
      keywords: 'wireless earbuds noise cancelling',
      searchVolume: 135000,
      'Search Volume (Current Month)': 145000,
      'Search Volume (Previous Month)': 125000,
      'Trend (%)': 16.0,
      competition: 'High',
      Difficulty: 85,
      Relevancy: 95,
      'Current Rank': 12,
      impressions: 10000,
      clicks: 250,
      ctr: 2.5,
      cpc: 0.6,
      acos: 17.65,
      sales: 850.5,
    },
    {
      keywords: 'bluetooth earphones wireless',
      searchVolume: 98000,
      'Search Volume (Current Month)': 102000,
      'Search Volume (Previous Month)': 95000,
      'Trend (%)': 7.4,
      competition: 'Medium',
      Difficulty: 65,
      Relevancy: 90,
      'Current Rank': 8,
      impressions: 8500,
      clicks: 220,
      ctr: 2.59,
      cpc: 0.55,
      acos: 16.8,
      sales: 650.0,
    },
    {
      keywords: 'true wireless earbuds waterproof',
      searchVolume: 74000,
      'Search Volume (Current Month)': 78000,
      'Search Volume (Previous Month)': 71000,
      'Trend (%)': 9.9,
      competition: 'Medium',
      Difficulty: 70,
      Relevancy: 85,
      'Current Rank': 15,
      impressions: 7200,
      clicks: 180,
      ctr: 2.5,
      cpc: 0.58,
      acos: 18.2,
      sales: 575.2,
    },
    {
      keywords: 'best running headphones',
      searchVolume: 45000,
      'Search Volume (Current Month)': 48000,
      'Search Volume (Previous Month)': 43000,
      'Trend (%)': 11.6,
      competition: 'High',
      Difficulty: 75,
      Relevancy: 80,
      'Current Rank': 25,
      impressions: 5000,
      clicks: 100,
      ctr: 2.0,
      cpc: 0.75,
      acos: 22.5,
      sales: 333.0,
    },
    {
      keywords: 'earbuds for small ears',
      searchVolume: 22000,
      'Search Volume (Current Month)': 21000,
      'Search Volume (Previous Month)': 23000,
      'Trend (%)': -8.7,
      competition: 'Low',
      Difficulty: 40,
      Relevancy: 92,
      'Current Rank': 5,
      impressions: 3000,
      clicks: 150,
      ctr: 5.0,
      cpc: 0.4,
      acos: 12.0,
      sales: 500.0,
    },
  ];
}

/** Generates sample data for Keyword Deduplicator tool */
function createKeywordDeduplicatorSampleData(): SampleData[] {
  // Focuses on keywords within campaign/ad group context
  return [
    {
      campaign: 'SP - Earbuds - Broad',
      'Ad Group': 'Wireless Earbuds',
      'Keyword/Target': 'wireless earbuds',
      'Match Type': 'Broad',
    },
    {
      campaign: 'SP - Earbuds - Phrase',
      'Ad Group': 'Wireless Earbuds',
      'Keyword/Target': 'wireless earbuds',
      'Match Type': 'Phrase',
    },
    {
      campaign: 'SP - Earbuds - Exact',
      'Ad Group': 'Wireless Earbuds',
      'Keyword/Target': 'wireless earbuds',
      'Match Type': 'Exact',
    },
    {
      campaign: 'SP - Earbuds - Broad',
      'Ad Group': 'Bluetooth Earphones',
      'Keyword/Target': 'bluetooth earphones',
      'Match Type': 'Broad',
    },
    {
      campaign: 'SP - Earbuds - Phrase',
      'Ad Group': 'Bluetooth Earphones',
      'Keyword/Target': 'bluetooth earphones',
      'Match Type': 'Phrase',
    },
    {
      campaign: 'SP - Earbuds - Broad',
      'Ad Group': 'Noise Cancelling',
      'Keyword/Target': 'noise cancelling earbuds',
      'Match Type': 'Broad',
    },
    {
      campaign: 'SP - Earbuds - Exact',
      'Ad Group': 'Noise Cancelling',
      'Keyword/Target': 'noise cancelling earbuds',
      'Match Type': 'Exact',
    },
    {
      campaign: 'SP - Earbuds - Broad',
      'Ad Group': 'Wireless Earbuds',
      'Keyword/Target': 'wireless earphones',
      'Match Type': 'Broad',
    }, // Potential duplicate/overlap
    {
      campaign: 'SP - Earbuds - Phrase',
      'Ad Group': 'Wireless Earbuds',
      'Keyword/Target': 'wireless earphones',
      'Match Type': 'Phrase',
    }, // Potential duplicate/overlap
  ];
}

/** Generates sample data for Listing Optimization/Quality Checker tool */
function createListingOptimizationSampleData(): SampleData[] {
  // Includes Title, Bullets, Description, Images, A+ Content, Backend Keywords
  return [
    {
      // Good Example
      ASIN: 'B08J4S5T7N',
      Title:
        'AuraSound Pro Wireless Earbuds - Active Noise Cancelling Headphones with 30Hr Battery Life, IPX7 Waterproof, Bluetooth 5.2',
      'Title Length': 135,
      'Bullet 1':
        '🎵 IMMERSIVE SOUND & ANC: Advanced 11mm dynamic drivers deliver crystal clear audio with deep bass. Active Noise Cancellation reduces ambient noise by up to 35dB for focused listening.',
      'Bullet 2':
        '🔋 EXTENDED PLAYTIME: Enjoy up to 6 hours of playtime on a single charge, with the compact charging case providing an additional 24 hours (30 hours total). USB-C fast charging.',
      'Bullet 3':
        '💧 WORKOUT READY (IPX7): Fully waterproof and sweatproof design protects your earbuds during intense workouts or rain. Ideal for running, gym, and sports.',
      'Bullet 4':
        '📞 CRYSTAL CLEAR CALLS: Features 4 microphones with environmental noise cancellation (ENC) technology to ensure your voice is heard clearly during calls, even in noisy environments.',
      'Bullet 5':
        '🤝 SECURE & COMFORTABLE FIT: Ergonomically designed with 3 sizes of soft silicone ear tips (S/M/L) included to ensure a secure, comfortable, and stable fit for all-day wear.',
      'Bullet Points Count': 5,
      description:
        'Experience the next level of wireless audio with AuraSound Pro Earbuds. Featuring cutting-edge Active Noise Cancellation (ANC) and premium 11mm drivers, these earbuds deliver rich, immersive sound while silencing distractions. Enjoy marathon listening sessions with up to 30 hours of total battery life and stay connected with crystal-clear calls thanks to the 4-mic ENC system. The IPX7 waterproof rating makes them perfect for any activity, and the ergonomic design ensures lasting comfort. Connect seamlessly with Bluetooth 5.2 technology. Includes earbuds, charging case, USB-C cable, and 3 ear tip sizes.',
      'Description Length': 690,
      'Image Count': 7,
      'Has A+ Content': 'Yes',
      'Backend Keywords':
        'wireless earbuds bluetooth earphones noise cancelling headphones waterproof earbuds sport headphones tws earbuds long battery life clear calls comfortable fit',
    },
    {
      // Needs Improvement Example
      ASIN: 'B07PXV77YQ',
      Title: 'Soundcore Earbuds', // Too short, lacks keywords
      'Title Length': 17,
      'Bullet 1': 'Good sound', // Vague, lacks detail
      'Bullet 2': 'Long battery', // Vague
      'Bullet 3': 'Waterproof', // Lacks specifics (IP rating)
      'Bullet 4': 'Clear calls', // Lacks specifics (mic tech)
      'Bullet 5': '', // Missing bullet point
      'Bullet Points Count': 4,
      description:
        'These are great earbuds. They sound good and last a long time. Good for calls. Buy them now!', // Too short, lacks detail and keywords
      'Description Length': 95,
      'Image Count': 4, // Could use more images/infographics
      'Has A+ Content': 'No',
      'Backend Keywords': 'earbuds, wireless', // Too few keywords
    },
  ];
}

/** Generates sample data for Description Editor tool */
function createDescriptionEditorSampleData(): SampleData[] {
  // Focuses on product name/ASIN and the description field
  return [
    {
      product: 'Organic Facial Cleanser',
      ASIN: 'B01ABCDEF1',
      description:
        'Our organic facial cleanser gently removes impurities and makeup, leaving your skin feeling refreshed and clean. Made with natural ingredients like Aloe Vera and Green Tea Extract, it is perfect for all skin types, including sensitive skin. Free from parabens, sulfates, and artificial fragrances. Experience a pure clean.',
    },
    {
      product: 'Vitamin C Serum',
      ASIN: 'B02ABCDEF2',
      description:
        'Brighten and rejuvenate your skin with our potent Vitamin C Serum. Formulated with 20% Vitamin C, Hyaluronic Acid, and Vitamin E, this powerful antioxidant serum helps reduce the appearance of fine lines, wrinkles, and dark spots while improving skin tone and texture for a radiant glow. Suitable for daily use.',
    },
    {
      product: 'Stainless Steel Water Bottle',
      ASIN: 'B03ABCDEF3',
      description:
        'Stay hydrated on the go with our durable stainless steel water bottle. Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof lid and BPA-free materials ensure safe and convenient use. 32 oz capacity.',
    },
  ];
}

/** Generates sample data for ACOS Calculator tool */
function createAcosCalculatorSampleData(): SampleData[] {
  // Requires campaign/ad group level spend and sales data
  return [
    { campaign: 'SP - Auto - Catch All', 'Ad Group': 'Group 1', spend: 150.75, sales: 850.2 },
    {
      campaign: 'SP - Manual - Broad Match',
      'Ad Group': 'Top Keywords',
      spend: 320.5,
      sales: 1100.0,
    },
    { campaign: 'SP - Manual - Exact Match', 'Ad Group': 'Brand Terms', spend: 55.2, sales: 980.5 },
    {
      campaign: 'SD - Product Targeting',
      'Ad Group': 'Competitor ASINs',
      spend: 210.0,
      sales: 650.8,
    },
    { campaign: 'SB - Video Ads', 'Ad Group': 'Category Awareness', spend: 450.0, sales: 1500.0 },
  ];
}

/** Generates sample data for PPC Campaign Auditor tool */
function createPpcCampaignAuditorSampleData(): SampleData[] {
  // Detailed performance metrics per campaign/ad group/keyword/target
  return [
    {
      campaign: 'SP - Auto - Bestsellers',
      'Ad Group': 'Auto Targeting',
      'Keyword/Target': 'Auto',
      'Match Type': 'Auto',
      impressions: 15000,
      clicks: 450,
      spend: 225.5,
      sales: 1200.0,
      orders: 48,
      acos: 18.79,
      'Conversion Rate': 10.67,
      ctr: 3.0,
      cpc: 0.5,
    },
    {
      campaign: 'SP - Manual - Brand Defense',
      'Ad Group': 'Brand Keywords',
      'Keyword/Target': 'aurasound pro earbuds',
      'Match Type': 'Exact',
      impressions: 8500,
      clicks: 380,
      spend: 190.0,
      sales: 950.0,
      orders: 38,
      acos: 20.0,
      'Conversion Rate': 10.0,
      ctr: 4.47,
      cpc: 0.5,
    },
    {
      campaign: 'SP - Manual - Category',
      'Ad Group': 'Category Keywords',
      'Keyword/Target': 'noise cancelling earbuds',
      'Match Type': 'Broad',
      impressions: 12000,
      clicks: 360,
      spend: 216.0,
      sales: 864.0,
      orders: 36,
      acos: 25.0,
      'Conversion Rate': 10.0,
      ctr: 3.0,
      cpc: 0.6,
    },
    {
      campaign: 'SP - Manual - Competitor',
      'Ad Group': 'Competitor ASINs',
      'Keyword/Target': 'asin="B07PXV77YQ"',
      'Match Type': 'Targeting',
      impressions: 9500,
      clicks: 190,
      spend: 152.0,
      sales: 450.0,
      orders: 15,
      acos: 33.78,
      'Conversion Rate': 7.89,
      ctr: 2.0,
      cpc: 0.8,
    },
    {
      campaign: 'SD - Product Targeting',
      'Ad Group': 'Complementary Products',
      'Keyword/Target': 'category="Electronics Accessories"',
      'Match Type': 'Targeting',
      impressions: 25000,
      clicks: 250,
      spend: 125.0,
      sales: 500.0,
      orders: 20,
      acos: 25.0,
      'Conversion Rate': 8.0,
      ctr: 1.0,
      cpc: 0.5,
    },
  ];
}

/** Generates sample data for Profit Margin / FBA Calculator tool */
function createProfitMarginFbaCalculatorSampleData(): SampleData[] {
  // Requires cost, price, fees, dimensions, weight, category
  return [
    {
      ASIN: 'B08J4S5T7N',
      SKU: 'AURA-PRO-01',
      product: 'AuraSound Pro Wireless Earbuds',
      cost: 22.5,
      price: 79.99,
      'FBA Fee Estimate': 5.99,
      'Referral Fee Estimate': 12.0,
      'Product Category': 'Electronics',
      'Est. Monthly Units': 450,
      'Length (in)': 3.5,
      'Width (in)': 2.0,
      'Height (in)': 1.5,
      'Weight (lb)': 0.25,
      adSpend: 1800.0 /* Optional: Total monthly ad spend for this product */,
    },
    {
      ASIN: 'B07PXV77YQ',
      SKU: 'SOUND-LIFE-P2',
      product: 'Soundcore Life P2 Earbuds',
      cost: 15.75,
      price: 49.99,
      'FBA Fee Estimate': 4.99,
      'Referral Fee Estimate': 7.5,
      'Product Category': 'Electronics',
      'Est. Monthly Units': 850,
      'Length (in)': 3.2,
      'Width (in)': 1.8,
      'Height (in)': 1.2,
      'Weight (lb)': 0.2,
      adSpend: 2500.0,
    },
    {
      ASIN: 'B08H8VZYF5',
      SKU: 'CAMP-BP-GRN',
      product: 'Camping Backpack 40L',
      cost: 12.0,
      price: 35.5,
      'FBA Fee Estimate': 6.5,
      'Referral Fee Estimate': 5.33,
      'Product Category': 'Sports & Outdoors',
      'Est. Monthly Units': 200,
      'Length (in)': 20.0,
      'Width (in)': 12.0,
      'Height (in)': 8.0,
      'Weight (lb)': 2.5,
      adSpend: 300.0,
    },
    {
      ASIN: 'B01N0XPBB3',
      SKU: 'TOY-BLOCK-SET',
      product: 'Creative Building Blocks Set (500pcs)',
      cost: 8.5,
      price: 19.99,
      'FBA Fee Estimate': 4.75,
      'Referral Fee Estimate': 3.0,
      'Product Category': 'Toys & Games',
      'Est. Monthly Units': 1200,
      'Length (in)': 10.0,
      'Width (in)': 8.0,
      'Height (in)': 4.0,
      'Weight (lb)': 1.8,
      adSpend: 1500.0,
    },
  ];
}

// --- Core Data Generation Logic ---

/**
 * Generates an array of sample data objects based on the specified data type.
 * @param dataType - The type of sample data to generate.
 * @returns An array of SampleData objects.
 * @throws Error if an unknown dataType is provided.
 */
export function generateSampleData(dataType: SampleDataType): SampleData[] {
  switch (dataType) {
    case 'competitor-analyzer':
      return createCompetitorAnalyzerSampleData();
    case 'sales-estimator':
      return createSalesEstimatorSampleData();
    case 'keyword-optimization': // Consolidates keyword analysis types
      return createKeywordOptimizationSampleData();
    case 'keyword-deduplicator':
      return createKeywordDeduplicatorSampleData();
    case 'listing-optimization': // Consolidates listing analysis types
      return createListingOptimizationSampleData();
    case 'description-editor':
      return createDescriptionEditorSampleData();
    case 'acos-calculator':
      return createAcosCalculatorSampleData();
    case 'ppc-campaign-auditor':
      return createPpcCampaignAuditorSampleData();
    case 'profit-margin-calculator': // Consolidates profit/FBA calculation inputs
    case 'fba-calculator':
      return createProfitMarginFbaCalculatorSampleData();
    default:
      // Ensure exhaustive check (useful if new types are added but not handled)
      // const _exhaustiveCheck: never = dataType;
      console.error(`Unknown sample data type requested: ${dataType}`);
      // Throw an error for invalid types instead of returning empty array
      throw new Error(`Sample data generation not implemented for type: ${dataType}`);
  }
}

/**
 * Converts an array of data objects into a CSV string using PapaParse.
 * Dynamically determines headers from the first object.
 * @param data - An array of SampleData objects.
 * @returns A CSV formatted string, or an empty string if data is empty.
 */
function generateCsvFromData(data: SampleData[]): string {
  if (!data || data.length === 0) {
    console.warn('generateCsvFromData called with empty data array.');
    return ''; // Return empty string for empty data
  }
  // Dynamically get headers from the keys of the first object
  // This ensures all populated fields in the generated data are included
  const headers = Object.keys(data[0]);
  try {
    return Papa.unparse(data, {
      header: true,
      columns: headers, // Explicitly use the derived headers
    });
  } catch (error) {
    console.error('Error during Papa.unparse:', error);
    throw new Error('Failed to generate CSV string from data.'); // Re-throw for better error tracking
  }
}

/**
 * Generates sample data for the given type, converts it to CSV,
 * and triggers a download in the browser.
 * @param dataType - The type of sample data to generate and download.
 * @param fileName - Optional custom filename for the downloaded CSV.
 * @throws Error if data generation or CSV conversion fails.
 */
export function downloadSampleCsv(dataType: SampleDataType, fileName?: string): void {
  console.log(`Attempting to generate and download sample CSV for: ${dataType}`);
  try {
    // 1. Generate fresh sample data
    const data = generateSampleData(dataType);
    // No need to check for empty data here, as generateSampleData throws on unknown type
    // and generateCsvFromData handles empty arrays if a known type somehow returns empty.

    // 2. Convert to CSV
    const csvData = generateCsvFromData(data);
    // generateCsvFromData throws if PapaParse fails

    // 3. Create Blob and Trigger Download
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Use a default filename pattern if none is provided
    link.setAttribute('download', fileName || `sample-${dataType}-data.csv`);
    document.body.appendChild(link);
    link.click();
    console.log(`Download triggered for: ${link.download}`);

    // 4. Clean up
    // Use requestAnimationFrame for potentially smoother cleanup after click dispatch
    requestAnimationFrame(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
      console.log(`Cleaned up resources for: ${dataType}`);
    });
  } catch (error) {
    // Log the specific error and re-throw to allow calling UI to handle it
    console.error(`Error generating or downloading sample CSV for ${dataType}:`, error);
    // Consider showing a user-friendly error message here or in the calling component
    // Example: alert(`Failed to download sample data: ${error.message}`);
    throw error; // Re-throw to be handled by the caller (e.g., display toast notification)
  }
}
