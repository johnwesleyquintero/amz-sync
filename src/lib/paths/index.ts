// Centralized path configuration for the entire application

// Application paths for routing and file system
export const paths = {
  // Root paths
  root: '/',
  api: '/api',
  assets: '/assets',
  public: '/public',

  // Feature paths
  tools: '/tools',
  dashboard: '/dashboard',
  documentation: '/docs',
  resources: '/resources',

  // Amazon seller tools paths
  amazonTools: {
    root: '/tools/amazon',
    acos: '/tools/amazon/acos-calculator',
    keywords: '/tools/amazon/keyword-analyzer',
    campaigns: '/tools/amazon/ppc-campaigns',
    listings: '/tools/amazon/listing-quality',
    competitors: '/tools/amazon/competitor-analysis',
    profitCalculator: '/tools/amazon/profit-calculator',
  },

  // API endpoints
  endpoints: {
    auth: '/api/auth',
    users: '/api/users',
    data: '/api/data',
    analytics: '/api/analytics',
    reports: '/api/reports',
  },

  // Asset paths
  images: {
    logos: '/assets/images/logos',
    icons: '/assets/images/icons',
    backgrounds: '/assets/images/backgrounds',
  },

  // Component paths
  components: {
    shared: '/src/components/shared',
    layout: '/src/components/layout',
    amazonTools: '/src/components/amazon-seller-tools',
    dashboard: '/src/components/dashboard',
    ui: '/src/components/ui',
  },
};

// Utility module paths for imports
const utilPaths = {
  // Core utility paths
  amazon: '../amazon-algorithms',
  csv: '../csv-utils',
  enhancedCsv: '../enhanced-csv-utils',
  financial: '../financial-utils',
  validation: '../validation-utils',
  ui: '../ui-utils',
  styling: '../styling-utils',
  error: '../error-handling',

  // Schema and validation paths
  schemas: '../schemas',
  schemaRegistry: '../schema-registry',
  schemaValidation: '../schema-validation',

  // Type definitions
  types: '../types',
  amazonTypes: '../amazon-types',

  // Configuration paths
  config: '../config',
  constants: '../config/constants',

  // Testing utilities
  tests: '../__tests__',

  // Documentation
  docs: '../docs',
};

// Common path combinations for related functionality
const commonPaths = {
  validation: {
    utils: utilPaths.validation,
    schema: utilPaths.schemaValidation,
    registry: utilPaths.schemaRegistry,
  },
  amazon: {
    algorithms: utilPaths.amazon,
    types: utilPaths.amazonTypes,
  },
  csv: {
    basic: utilPaths.csv,
    enhanced: utilPaths.enhancedCsv,
  },
};

// Helper function to construct full URLs
export const getFullUrl = (path: string, params?: Record<string, string>): string => {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  return url;
};

// Export individual path groups for more granular imports
export const { amazonTools, endpoints, images, components } = appPaths;

// Default export for convenience
export default {
  app: appPaths,
  util: utilPaths,
  common: commonPaths,
  getFullUrl,
};
