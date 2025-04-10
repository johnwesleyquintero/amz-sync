import { z } from 'zod';
import { CampaignData, TrendData } from './acos-utils';
import {
  InventoryOptimizationError,
  PricingOptimizationError,
  ValidationError,
  SecurityError,
} from './amazon-errors';

// Common validation patterns
const patterns = {
  email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
  url: /^https?:\/\/[\w-_]+(\.[\w-_]+)+[\w-.,@?^=%&:/~#]*$/,
  asin: /^[A-Z0-9]{10}$/,
  sku: /^[A-Za-z0-9-_]{1,40}$/,
};

// Security configurations
export const securityConfig = {
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
  },
  headers: {
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; script-src 'self'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },
};

// Input sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\p{Cc}]/gu, ''); // Remove control characters using Unicode property escapes
}

// CSRF token validation
export function validateCSRFToken(token: string | undefined, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    throw new SecurityError('Missing CSRF token');
  }
  if (token !== expectedToken) {
    throw new SecurityError('Invalid CSRF token');
  }
  return true;
}

// Campaign data validation schema
const campaignDataSchema = z.object({
  campaign: z.string().min(1, 'Campaign name is required'),
  adSpend: z.number().min(0, 'Ad spend must be non-negative'),
  sales: z.number().min(0, 'Sales must be non-negative'),
  impressions: z.number().min(0, 'Impressions must be non-negative').optional(),
  clicks: z.number().min(0, 'Clicks must be non-negative').optional(),
});

// Trend data validation schema
const trendDataSchema = z.object({
  previousPeriodSales: z.number().min(0, 'Previous period sales must be non-negative'),
  previousPeriodAdSpend: z.number().min(0, 'Previous period ad spend must be non-negative'),
  industryAverageCTR: z.number().min(0).max(100).optional(),
  industryAverageConversion: z.number().min(0).max(100).optional(),
  seasonalityFactor: z.number().min(0.1).max(10).optional(),
  marketTrend: z.enum(['rising', 'stable', 'declining']).optional(),
  competitionLevel: z.enum(['low', 'medium', 'high']).optional(),
});

const todoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'in-progress', 'completed', 'archived']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const validateTodoItem = (data: unknown) => {
  return todoSchema.safeParse(data);
};

// Product pricing data validation schema
const productPricingSchema = z.object({
  cost: z.number().min(0, 'Cost must be non-negative'),
  targetMargin: z.number().min(0, 'Target margin must be non-negative'),
  seasonalityFactor: z.number().min(0.1).max(10).optional(),
  marketStrategy: z.enum(['premium', 'competitive', 'economy']).optional(),
});

/**
 * Validates campaign data and returns the validated data or throws an error
 */
export function validateCampaignData(data: unknown): CampaignData {
  try {
    return campaignDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new InventoryOptimizationError('Invalid campaign data', error.issues);
    }
    throw error;
  }
}

/**
 * Validates trend data and returns the validated data or throws an error
 */
export function validateTrendData(data: unknown): TrendData {
  try {
    return trendDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new InventoryOptimizationError('Invalid trend data', error.issues);
    }
    throw error;
  }
}

/**
 * Validates product pricing data and returns the validated data or throws an error
 */
export function validateProductPricingData(data: unknown): {
  cost: number;
  targetMargin: number;
  seasonalityFactor?: number;
  marketStrategy?: 'premium' | 'competitive' | 'economy';
} {
  try {
    return productPricingSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new PricingOptimizationError('Invalid product pricing data');
    }
    throw error;
  }
}

/**
 * Validates competitor prices array
 */
export function validateCompetitorPrices(prices: unknown): number[] {
  if (!Array.isArray(prices) || prices.length === 0) {
    throw new PricingOptimizationError('Competitor prices must be a non-empty array');
  }

  const validPrices = prices.every(price => typeof price === 'number' && price >= 0);
  if (!validPrices) {
    throw new PricingOptimizationError('All competitor prices must be non-negative numbers');
  }

  return prices;
}

// Rate limiting check
export function checkRateLimit(requestCount: number, windowStart: number): boolean {
  const { windowMs, maxRequests } = securityConfig.rateLimiting;
  const currentTime = Date.now();

  if (currentTime - windowStart > windowMs) {
    return true; // New window starts
  }

  if (requestCount >= maxRequests) {
    throw new SecurityError(
      `Rate limit exceeded. Try again after ${Math.ceil((windowMs - (currentTime - windowStart)) / 1000)} seconds`
    );
  }

  return true;
}

// Apply security headers
export function getSecurityHeaders(): Record<string, string> {
  return securityConfig.headers;
}

// CSV Schema Validation

export function validateCsvWithSchema(data: Record<string, unknown>[], schema: CsvSchema): void {
  const errors: ValidationError[] = [];

  data.forEach((row, index) => {
    // Validate required columns
    Object.entries(schema.columns).forEach(([colName, def]) => {
      if (def.required && !(colName in row)) {
        errors.push(
          new ValidationError(`Missing required column '${colName}' at row ${index + 1}`)
        );
      }

      if (row[colName]) {
        // Type checking
        const actualType = detectDataType(row[colName]);
        if (actualType !== def.dataType) {
          errors.push(
            new ValidationError(
              `Invalid type for '${colName}' at row ${index + 1}: Expected ${def.dataType} but got ${actualType}`
            )
          );
        }

        // Format validation
        if (def.format && !def.format.test(String(row[colName]))) {
          errors.push(new ValidationError(`Invalid format for '${colName}' at row ${index + 1}`));
        }

        // Value range checks
        if (typeof def.min === 'number' && Number(row[colName]) < def.min) {
          errors.push(
            new ValidationError(
              `Value too low for '${colName}' at row ${index + 1}: Minimum ${def.min}`
            )
          );
        }

        if (typeof def.max === 'number' && Number(row[colName]) > def.max) {
          errors.push(
            new ValidationError(
              `Value too high for '${colName}' at row ${index + 1}: Maximum ${def.max}`
            )
          );
        }

        // Allowed values check
        if (def.allowedValues && !def.allowedValues.includes(String(row[colName]))) {
          errors.push(
            new ValidationError(
              `Invalid value for '${colName}' at row ${index + 1}: Not in allowed values`
            )
          );
        }
      }
    });

    // Strict mode validation
    if (schema.strictMode) {
      Object.keys(row).forEach(colName => {
        if (!schema.columns[colName]) {
          errors.push(
            new ValidationError(`Unexpected column '${colName}' at row ${index + 1} in strict mode`)
          );
        }
      });
    }
  });

  if (errors.length > 0) {
    throw new AggregateError(errors, 'CSV validation failed');
  }
}

function detectDataType(value: unknown): string {
  if (typeof value === 'string') {
    if (!isNaN(Date.parse(value))) return 'date';
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') return 'boolean';
    return 'string';
  }
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return typeof value;
}

export interface CsvSchema {
  columns: {
    [key: string]: {
      dataType: 'string' | 'number' | 'date';
      required?: boolean;
      format?: RegExp;
      min?: number;
      max?: number;
      allowedValues?: string[];
    };
  };
  strictMode?: boolean;
}

// Predefined schemas for common CSV types
export const csvSchemas = {
  acosReport: {
    columns: {
      'Campaign Name': { dataType: 'string', required: true },
      Spend: { dataType: 'number', required: true, min: 0 },
      Sales: { dataType: 'number', required: true, min: 0 },
      ACoS: { dataType: 'number', required: true, min: 0, max: 100 },
      Impressions: { dataType: 'number', min: 0 },
      Clicks: { dataType: 'number', min: 0 },
    },
    strictMode: true,
  },
  fbaInventory: {
    columns: {
      SKU: { dataType: 'string', required: true, format: /^[A-Z0-9-]{1,40}$/ },
      FNSKU: { dataType: 'string', format: /^[A-Z0-9]{10}$/ },
      Quantity: { dataType: 'number', required: true, min: 0 },
      Condition: { dataType: 'string', allowedValues: ['NEW', 'REFURBISHED', 'USED'] },
    },
  },
};
