// Centralized path configuration for the application

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

  // Utility paths
  utils: {
    amazon: '/src/lib/amazon',
    validation: '/src/lib/validation',
    errors: '/src/lib/errors',
    schemas: '/src/lib/schemas',
  },
};

// Export individual path groups for more granular imports
export const { amazonTools, endpoints, images, components, utils } = paths;

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
