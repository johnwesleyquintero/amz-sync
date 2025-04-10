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
  | 'description';

export function generateSampleCsv(dataType: SampleDataType): string {
  let data: SampleData[] = [];

  switch (dataType) {
    // --- Tools Requiring New/Enhanced Sample Data ---

    case 'sales-estimator':
      // Input data likely used by a sales estimator tool
      data = [
        { ASIN: 'B08J4S5T7N', Category: 'Electronics > Headphones > Earbud Headphones', BSR: 580, price: 79.99, 'Review Count': 1520, Rating: 4.4 },
        { ASIN: 'B07PXV77YQ', Category: 'Electronics > Headphones > Earbud Headphones', BSR: 120, price: 49.99, 'Review Count': 185430, Rating: 4.3 },
        { ASIN: 'B08G4K8CY8', Category: 'Electronics > Headphones > Earbud Headphones', BSR: 85, price: 25.99, 'Review Count': 310550, Rating: 4.4 },
        { ASIN: 'B094N6S3LP', Category: 'Electronics > Headphones > Earbud Headphones', BSR: 350, price: 99.95, 'Review Count': 88760, Rating: 4.3 },
        { ASIN: 'B09JQS51C1', Category: 'Electronics > Headphones > Earbud Headphones', BSR: 950, price: 279.00, 'Review Count': 15980, Rating: 4.2 },
        { ASIN: 'B07XJ8C8F5', Category: 'Home & Kitchen > Kitchen & Dining > Small Appliances', BSR: 2100, price: 129.99, 'Review Count': 25000, Rating: 4.7 },
        { ASIN: 'B08H8VZYF5', Category: 'Sports & Outdoors > Outdoor Recreation > Camping & Hiking', BSR: 550, price: 35.50, 'Review Count': 800, Rating: 4.1 },
        { ASIN: 'B01N0XPBB3', Category: 'Toys & Games > Building Toys > Building Sets', BSR: 150, price: 19.99, 'Review Count': 45000, Rating: 4.8 },
      ];
      break;

    case 'keyword-optimization':
    case 'keyword-analyzer': // Reusing the same data for general analysis
      // Data focused on keyword metrics for optimization/analysis
      data = [
        { keywords: 'wireless earbuds', searchVolume: 150000, Difficulty: 85, Relevancy: 90, 'Current Rank': 5, cpc: 1.25, ctr: 2.1 },
        { keywords: 'noise cancelling earbuds', searchVolume: 90000, Difficulty: 78, Relevancy: 95, 'Current Rank': 8, cpc: 1.50, ctr: 2.5 },
        { keywords: 'bluetooth headphones', searchVolume: 120000, Difficulty: 80, Relevancy: 70, 'Current Rank': 12, cpc: 0.90, ctr: 1.8 },
        { keywords: 'earbuds for running', searchVolume: 45000, Difficulty: 65, Relevancy: 85, 'Current Rank': 3, cpc: 1.10, ctr: 3.0 },
        { keywords: 'cheap wireless earbuds', searchVolume: 75000, Difficulty: 70, Relevancy: 60, 'Current Rank': 15, cpc: 0.75, ctr: 1.5 },
        { keywords: 'waterproof earbuds', searchVolume: 55000, Difficulty: 68, Relevancy: 88, 'Current Rank': 6, cpc: 1.15, ctr: 2.8 },
        { keywords: 'best budget earbuds 2024', searchVolume: 15000, Difficulty: 55, Relevancy: 75, 'Current Rank': 2, cpc: 1.30, ctr: 3.5 },
        { keywords: 'true wireless earbuds', searchVolume: 100000, Difficulty: 82, Relevancy: 92, 'Current Rank': 7, cpc: 1.20, ctr: 2.3 },
      ];
      break;

    case 'keyword-trend-analyzer':
      // Data showing keyword search volume over time
      data = [
        { keywords: 'wireless earbuds', 'Search Volume (Current Month)': 150000, 'Search Volume (Previous Month)': 145000, 'Trend (%)': 3.4 },
        { keywords: 'noise cancelling earbuds', 'Search Volume (Current Month)': 90000, 'Search Volume (Previous Month)': 95000, 'Trend (%)': -5.3 },
        { keywords: 'bluetooth headphones', 'Search Volume (Current Month)': 120000, 'Search Volume (Previous Month)': 110000, 'Trend (%)': 9.1 },
        { keywords: 'air fryer', 'Search Volume (Current Month)': 250000, 'Search Volume (Previous Month)': 260000, 'Trend (%)': -3.8 },
        { keywords: 'yoga mat', 'Search Volume (Current Month)': 80000, 'Search Volume (Previous Month)': 75000, 'Trend (%)': 6.7 },
        { keywords: 'electric scooter', 'Search Volume (Current Month)': 60000, 'Search Volume (Previous Month)': 50000, 'Trend (%)': 20.0 },
        { keywords: 'weighted blanket', 'Search Volume (Current Month)': 110000, 'Search Volume (Previous Month)': 130000, 'Trend (%)': -15.4 },
      ];
      break;

    case 'listing-optimization':
      // Data representing key text fields of a listing for optimization suggestions
      data = [
        { ASIN: 'B08J4S5T7N', Title: 'AuraSound Pro Wireless Earbuds - Noise Cancelling, 30hr Playtime', 'Bullet 1': 'CRYSTAL CLEAR SOUND: Precision-tuned drivers deliver immersive audio.', 'Bullet 2': 'ACTIVE NOISE CANCELLATION: Block out distractions for pure listening.', 'Bullet 3': 'ALL-DAY BATTERY: Get up to 30 hours total playtime with charging case.', 'Bullet 4': 'COMFORT FIT: Ergonomic design with multiple ear tip sizes.', 'Bullet 5': 'IPX5 WATER RESISTANT: Perfect for workouts and commutes.', description: 'Experience unparalleled audio with AuraSound Pro. Our wireless earbuds feature advanced noise cancellation, long-lasting battery, and a comfortable, secure fit. Ideal for music lovers, commuters, and fitness enthusiasts.', 'Backend Keywords': 'earphones bluetooth waterproof sport running gym noise canceling anc' },
        { ASIN: 'B07XJ8C8F5', Title: 'QuickPot 8-in-1 Multi-Cooker 6 Qt', 'Bullet 1': 'VERSATILE COOKING: Pressure cook, slow cook, rice cook, steam, saute, yogurt maker, warmer.', 'Bullet 2': 'FAST & EFFICIENT: Cooks up to 70% faster, saving time and energy.', 'Bullet 3': 'EASY TO USE: Simple controls with 14 built-in smart programs.', 'Bullet 4': 'SAFE & RELIABLE: 10+ safety features ensure peace of mind.', 'Bullet 5': 'FAMILY SIZE: 6-quart capacity perfect for families or meal prepping.', description: 'The QuickPot is your ultimate kitchen companion. This versatile multi-cooker replaces multiple appliances, making mealtime easier and faster. Enjoy delicious, healthy meals with minimal effort.', 'Backend Keywords': 'instant pot pressure cooker slow cooker rice cooker steamer saute yogurt maker electric' },
        // Add 1-2 more sample listings
      ];
      break;

    case 'listing-quality-checker':
      // Data representing metrics used to score listing quality
      data = [
        { ASIN: 'B08J4S5T7N', Title: 'AuraSound Pro Wireless Earbuds - Noise Cancelling, 30hr Playtime', 'Title Length': 68, 'Bullet Points Count': 5, 'Description Length': 250, 'Image Count': 7, 'Has A+ Content': 'Yes', Rating: 4.4, 'Review Count': 1520 },
        { ASIN: 'B07PXV77YQ', Title: 'Anker Soundcore Life P2 True Wireless Earbuds with 4 Mics, CVC 8.0 Noise Reduction', 'Title Length': 85, 'Bullet Points Count': 5, 'Description Length': 450, 'Image Count': 6, 'Has A+ Content': 'Yes', Rating: 4.3, 'Review Count': 185430 },
        { ASIN: 'B08G4K8CY8', Title: 'TOZO T10 Bluetooth 5.3 Wireless Earbuds with Wireless Charging Case IPX8 Waterproof', 'Title Length': 88, 'Bullet Points Count': 5, 'Description Length': 380, 'Image Count': 8, 'Has A+ Content': 'No', Rating: 4.4, 'Review Count': 310550 },
        { ASIN: 'B07XJ8C8F5', Title: 'QuickPot 8-in-1 Multi-Cooker 6 Qt', 'Title Length': 36, 'Bullet Points Count': 5, 'Description Length': 180, 'Image Count': 5, 'Has A+ Content': 'Yes', Rating: 4.7, 'Review Count': 25000 },
        { ASIN: 'B08H8VZYF5', Title: 'TrailBlazer Camping Tent - 2 Person Waterproof Dome Tent', 'Title Length': 59, 'Bullet Points Count': 4, 'Description Length': 150, 'Image Count': 6, 'Has A+ Content': 'No', Rating: 4.1, 'Review Count': 800 },
      ];
      break;

    case 'ppc-campaign-auditor':
      // Enhanced PPC data suitable for auditing performance
      data = [
        { campaign: 'SP - Earbuds - Exact', 'Ad Group': 'Noise Cancelling', 'Keyword/Target': 'noise cancelling earbuds', 'Match Type': 'Exact', impressions: 5500, clicks: 110, ctr: 2.00, cpc: 1.45, spend: 159.50, orders: 8, sales: 639.92, 'Conversion Rate': 7.27, acos: 24.93, roas: 4.01 },
        { campaign: 'SP - Earbuds - Broad', 'Ad Group': 'General Earbuds', 'Keyword/Target': 'wireless earbuds', 'Match Type': 'Broad', impressions: 25000, clicks: 375, ctr: 1.50, cpc: 0.85, spend: 318.75, orders: 15, sales: 1199.85, 'Conversion Rate': 4.00, acos: 26.57, roas: 3.76 },
        { campaign: 'SP - Earbuds - Auto', 'Ad Group': 'Auto Group 1', 'Keyword/Target': '*', 'Match Type': 'Auto', impressions: 12000, clicks: 180, ctr: 1.50, cpc: 0.95, spend: 171.00, orders: 10, sales: 799.90, 'Conversion Rate': 5.56, acos: 21.38, roas: 4.68 },
        { campaign: 'SB - Brand Awareness', 'Ad Group': 'Brand Terms', 'Keyword/Target': 'AuraSound', 'Match Type': 'Exact', impressions: 8000, clicks: 240, ctr: 3.00, cpc: 0.60, spend: 144.00, orders: 5, sales: 399.95, 'Conversion Rate': 2.08, acos: 36.00, roas: 2.78 },
        { campaign: 'SD - Competitor Targeting', 'Ad Group': 'Competitor ASINs', 'Keyword/Target': 'asin="B07PXV77YQ"', 'Match Type': 'Targeting', impressions: 15000, clicks: 150, ctr: 1.00, cpc: 1.10, spend: 165.00, orders: 6, sales: 479.94, 'Conversion Rate': 4.00, acos: 34.38, roas: 2.91 },
        { campaign: 'SP - Kitchen - Phrase', 'Ad Group': 'Multi Cooker', 'Keyword/Target': '"multi cooker"', 'Match Type': 'Phrase', impressions: 9500, clicks: 190, ctr: 2.00, cpc: 1.05, spend: 199.50, orders: 12, sales: 1559.88, 'Conversion Rate': 6.32, acos: 12.79, roas: 7.82 },
      ];
      break;

    case 'profit-margin-calculator':
      // Data needed to calculate profit margins per product
      data = [
        { SKU: 'AURA-PRO-BLK', ASIN: 'B08J4S5T7N', 'Product Name': 'AuraSound Pro - Black', 'Sale Price': 79.99, 'Cost of Goods': 25.50, 'FBA Fee Estimate': 12.50, 'Referral Fee Estimate': 12.00, 'Est. Monthly Units': 300, 'Ad Spend per Unit': 5.00 },
        { SKU: 'AURA-PRO-WHT', ASIN: 'B08J4S5T7O', 'Product Name': 'AuraSound Pro - White', 'Sale Price': 79.99, 'Cost of Goods': 25.50, 'FBA Fee Estimate': 12.50, 'Referral Fee Estimate': 12.00, 'Est. Monthly Units': 150, 'Ad Spend per Unit': 6.50 },
        { SKU: 'QKPT-6QT', ASIN: 'B07XJ8C8F5', 'Product Name': 'QuickPot 6 Qt', 'Sale Price': 129.99, 'Cost of Goods': 45.00, 'FBA Fee Estimate': 18.00, 'Referral Fee Estimate': 19.50, 'Est. Monthly Units': 500, 'Ad Spend per Unit': 8.00 },
        { SKU: 'TRBZ-TENT-2P', ASIN: 'B08H8VZYF5', 'Product Name': 'TrailBlazer Tent 2P', 'Sale Price': 35.50, 'Cost of Goods': 11.00, 'FBA Fee Estimate': 8.50, 'Referral Fee Estimate': 5.33, 'Est. Monthly Units': 100, 'Ad Spend per Unit': 2.50 },
        { SKU: 'LEGO-SET-123', ASIN: 'B01N0XPBB3', 'Product Name': 'Space Explorer Lego Set', 'Sale Price': 19.99, 'Cost of Goods': 6.50, 'FBA Fee Estimate': 5.50, 'Referral Fee Estimate': 3.00, 'Est. Monthly Units': 800, 'Ad Spend per Unit': 1.00 },
      ];
      break;

    case 'fba-calculator':
      // Data including dimensions and weight for FBA fee calculation
      data = [
        { SKU: 'AURA-PRO-BLK', ASIN: 'B08J4S5T7N', 'Product Name': 'AuraSound Pro - Black', 'Length (in)': 4.5, 'Width (in)': 3.5, 'Height (in)': 1.8, 'Weight (lb)': 0.45, 'Product Category': 'Electronics', 'Sale Price': 79.99, 'Cost of Goods': 25.50 },
        { SKU: 'QKPT-6QT', ASIN: 'B07XJ8C8F5', 'Product Name': 'QuickPot 6 Qt', 'Length (in)': 14.0, 'Width (in)': 13.5, 'Height (in)': 13.0, 'Weight (lb)': 15.0, 'Product Category': 'Home & Kitchen', 'Sale Price': 129.99, 'Cost of Goods': 45.00 },
        { SKU: 'TRBZ-TENT-2P', ASIN: 'B08H8VZYF5', 'Product Name': 'TrailBlazer Tent 2P', 'Length (in)': 18.0, 'Width (in)': 6.0, 'Height (in)': 6.0, 'Weight (lb)': 4.5, 'Product Category': 'Sports & Outdoors', 'Sale Price': 35.50, 'Cost of Goods': 11.00 },
        { SKU: 'BOOK-XYZ', ASIN: 'B09XYZABCD', 'Product Name': 'The Great Novel', 'Length (in)': 9.0, 'Width (in)': 6.0, 'Height (in)': 1.2, 'Weight (lb)': 1.1, 'Product Category': 'Books', 'Sale Price': 14.99, 'Cost of Goods': 2.50 },
        { SKU: 'MUG-CAT', ASIN: 'B08CATDOGE', 'Product Name': 'Funny Cat Mug', 'Length (in)': 5.0, 'Width (in)': 4.5, 'Height (in)': 4.0, 'Weight (lb)': 0.9, 'Product Category': 'Home & Kitchen', 'Sale Price': 12.95, 'Cost of Goods': 3.00 },
      ];
      break;

    // --- Existing/Original Sample Data (kept for reference or direct use) ---

    case 'competitor-analyzer':
      // Structure: First row = Seller's Product, Subsequent rows = Competitors
      data = createCompetitorAnalyzerSampleData(); // Using helper function below
      break;

    case 'keyword-deduplicator':
      // Data with duplicate/similar keywords for deduplication tool
      data = [
        { product: 'Organic Facial Cleanser', keywords: 'organic face wash, face wash organic, natural cleanser, gentle facial cleanser, organic cleanser, facial cleanser, face wash' },
        { product: 'Vitamin C Serum', keywords: 'vitamin c serum, face serum, serum vitamin c, anti-aging serum, brightening serum, skin care serum, serum' },
        { product: 'Hydrating Face Mask', keywords: 'hydrating face mask, face mask hydrating, moisturizing mask, face mask for dry skin, sheet mask, mask' },
        { product: 'Anti-Aging Eye Cream', keywords: 'anti-aging eye cream, eye cream anti-aging, wrinkle cream, dark circle treatment, eye care cream, eye cream' },
        { product: 'Natural Lip Balm', keywords: 'natural lip balm, lip balm natural, organic lip balm, moisturizing lip balm, chapstick, lip balm' },
        // ... (add more if needed)
      ];
      break;

    case 'description-editor':
      // Data containing ASIN and description for editing
      data = [
        { product: 'Organic Facial Cleanser', ASIN: 'B01ABCDEF1', description: 'Our organic facial cleanser gently removes impurities and makeup, leaving your skin feeling refreshed and clean. Made with natural ingredients, it is perfect for all skin types.' },
        { product: 'Vitamin C Serum', ASIN: 'B02ABCDEF2', description: 'Brighten and rejuvenate your skin with our Vitamin C Serum. This powerful antioxidant serum helps reduce the appearance of fine lines and wrinkles while improving skin tone and texture.' },
        { product: 'Hydrating Face Mask', ASIN: 'B03ABCDEF3', description: "Quench your skin's thirst with our Hydrating Face Mask. This mask provides deep hydration, leaving your skin soft, supple, and glowing." },
        // ... (add more if needed)
      ];
      break;

    case 'acos-calculator': // Uses 'acos' sample data as input
    case 'acos':
      // Represents typical ACOS report data
      data = [
        { product: 'Organic Facial Cleanser', campaign: 'Auto Campaign - Facial Cleanser', adSpend: 120.5, sales: 580.75, impressions: 9500, clicks: 225 },
        { product: 'Vitamin C Serum', campaign: 'Manual Campaign - Vitamin C Serum', adSpend: 187.5, sales: 845.6, impressions: 14200, clicks: 310 },
        { product: 'Anti-Aging Eye Cream', campaign: 'Sponsored Products - Eye Cream', adSpend: 150.0, sales: 750.0, impressions: 9000, clicks: 220 },
        { product: 'Herbal Hair Growth Oil', campaign: 'Auto Campaign - Hair Growth Oil', adSpend: 110.0, sales: 550.0, impressions: 7000, clicks: 180 },
        { product: 'Hydrating Face Mask', campaign: 'Manual Campaign - Face Mask', adSpend: 132.4, sales: 610.25, impressions: 11500, clicks: 260 },
        // ... (add more if needed)
      ];
      break;

    // --- Original Samples (potentially less specific than new ones) ---
    case 'fba': // Less detailed than profit-margin-calculator
      data = [
        { product: 'Organic Facial Cleanser', cost: 4.5, price: 18.99, fees: 3.5 },
        { product: 'Vitamin C Serum', cost: 6.25, price: 24.99, fees: 4.25 },
        // ... (original data)
      ];
      break;
    case 'keyword': // Less detailed than keyword-optimization
      data = [
        { product: 'Organic Facial Cleanser', keywords: 'organic face wash, natural cleanser, gentle facial cleanser, sensitive skin cleanser', searchVolume: 45000, competition: 'Medium' },
        { product: 'Vitamin C Serum', keywords: 'vitamin c serum, face serum, anti-aging serum, brightening serum, skin care', searchVolume: 68000, competition: 'High' },
        // ... (original data)
      ];
      break;
    case 'ppc': // Less detailed than ppc-campaign-auditor
      data = [
        { product: 'Organic Facial Cleanser', name: 'Auto Campaign - Facial Cleanser', type: 'Auto', spend: 120.5, sales: 650.0, impressions: 8500, clicks: 210, ctr: 2.47, cpc: 0.57, acos: 18.54 },
        { product: 'Vitamin C Serum', name: 'Sponsored Products - Vitamin C', type: 'Sponsored Products', spend: 180.0, sales: 950.0, impressions: 12000, clicks: 300, ctr: 2.5, cpc: 0.6, acos: 18.95 },
        // ... (original data)
      ];
      break;
    case 'description': // Same as description-editor
       data = [
        { product: 'Organic Facial Cleanser', ASIN: 'B01ABCDEF1', description: 'Our organic facial cleanser gently removes impurities and makeup, leaving your skin feeling refreshed and clean. Made with natural ingredients, it is perfect for all skin types.' },
        { product: 'Vitamin C Serum', ASIN: 'B02ABCDEF2', description: 'Brighten and rejuvenate your skin with our Vitamin C Serum. This powerful antioxidant serum helps reduce the appearance of fine lines and wrinkles while improving skin tone and texture.' },
        // ... (original data)
      ];
      break;


    default:
      // Ensure exhaustive check or handle unknown types
      const exhaustiveCheck: never = dataType;
      console.warn(`Unknown sample data type requested: ${exhaustiveCheck}`);
      return '';
  }

  // Use PapaParse to convert the array of objects into a CSV string
  // Explicitly define headers based on the keys of the first object (or a predefined list)
  // This ensures consistent column order, especially if some rows lack optional fields.
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  return Papa.unparse(data, { header: true, columns: headers });
}

export function downloadSampleCsv(dataType: SampleDataType, fileName?: string): void {
  const csv = generateSampleCsv(dataType);
  if (!csv) {
    console.error('Failed to generate CSV data for type:', dataType);
    // Optionally show a user-facing error message here
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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
      Title: 'Beats Studio Buds – True Wireless Noise Cancelling Earbuds – Compatible with Apple & Android',
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
      Title: 'Bose QuietComfort Earbuds II, Wireless, Bluetooth, World’s Best Noise Cancelling In-Ear Headphones',
      price: 279.00,
      Rating: 4.2,
      'Review Count': 15980,
      BSR: 950,
      Category: 'Electronics > Headphones > Earbud Headphones',
      'Seller Type': 'FBA',
    },
  ];
}
