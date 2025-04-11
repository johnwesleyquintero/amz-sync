// Centralized exports for utility functions and types
import { utilPaths, commonPaths } from '../paths';
import type { UtilPaths, CommonPaths } from '../paths';

// Import utility modules using centralized paths
import * as amazonUtils from '../amazon-algorithms';
import * as csvUtils from '../csv-utils';
import * as enhancedCsvUtils from '../enhanced-csv-utils';
import * as financialUtils from '../financial-utils';
import * as validationUtils from '../validation-utils';
import * as uiUtils from '../ui-utils';
import * as stylingUtils from '../styling-utils';
import * as errorHandling from '../error-handling';

// Import types from utility modules
import type { AmazonMetrics } from '../amazon-types';
import type { ValidationSchema } from '../schema-validation';
import type { CSVData } from '../csv-utils';
import type { FinancialData } from '../financial-utils';

// Re-export path types
export type { UtilPaths, CommonPaths };
export type { AmazonMetrics, ValidationSchema, CSVData, FinancialData };

// Export utility functions and types
export {
  // Amazon-specific utilities
  amazonUtils,
  csvUtils,
  enhancedCsvUtils,
  financialUtils,

  // Validation and error handling
  validationUtils,
  errorHandling,

  // UI and styling utilities
  uiUtils,
  stylingUtils,
};

// Export commonly used utility functions directly
export const { calculateACoS, analyzePPCCampaign, optimizeKeywords } = amazonUtils;

export const { validateCSV, processCSVData, generateSampleCSV } = csvUtils;

export const { formatCurrency, calculateROI, calculateProfit } = financialUtils;

export const { validateInput, sanitizeData, validateSchema } = validationUtils;

// Export default utility object with organized structure
export default {
  paths: commonPaths,
  modules: {
    amazon: amazonUtils,
    csv: csvUtils,
    enhanced: enhancedCsvUtils,
    financial: financialUtils,
    validation: validationUtils,
    ui: uiUtils,
    styling: stylingUtils,
    error: errorHandling,
  },
};
