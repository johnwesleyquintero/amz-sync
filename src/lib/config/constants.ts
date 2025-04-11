// Application-wide constants and configuration settings

export const APP_CONFIG = {
  // Application metadata
  name: 'Amazon Analytics',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',

  // Feature flags
  features: {
    enableBetaFeatures: false,
    enableAnalytics: true,
    enableNotifications: true,
  },

  // API configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },

  // Batch processing settings
  batch: {
    defaultSize: 1000,
    maxSize: 5000,
    memoryThreshold: 1024 * 1024 * 100, // 100MB
  },

  // Validation settings
  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['.csv', '.xlsx', '.json'],
    maxKeywordLength: 100,
  },

  // UI configuration
  ui: {
    theme: {
      primary: '#0066cc',
      secondary: '#6c757d',
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
    },
    pagination: {
      defaultPageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
    },
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
  },

  // Error messages
  errors: {
    network: 'Network error occurred. Please check your connection.',
    validation: 'Please check your input and try again.',
    unauthorized: 'You are not authorized to perform this action.',
    notFound: 'The requested resource was not found.',
    server: 'An unexpected error occurred. Please try again later.',
  },
};

// Export individual config sections for more granular imports
export const { features, api, batch, validation, ui, errors } = APP_CONFIG;

// Helper function to get environment-specific values
export const getEnvConfig = (key: keyof typeof APP_CONFIG) => {
  return APP_CONFIG[key];
};
