import { describe, it, expect } from 'vitest';
import {
  validateCampaignData,
  validateTrendData,
  validateProductPricingData,
  validateCompetitorPrices,
  sanitizeString,
  validateCSRFToken,
  checkRateLimit,
  getSecurityHeaders,
} from '../validation-utils';
import {
  ValidationError,
  SecurityError,
  InventoryOptimizationError,
  PricingOptimizationError,
} from '../amazon-errors';

describe('Validation Utils', () => {
  describe('Campaign Data Validation', () => {
    it('should validate correct campaign data', () => {
      const validData = {
        campaign: 'Test Campaign',
        adSpend: 100,
        sales: 500,
        impressions: 1000,
        clicks: 50,
      };
      expect(() => validateCampaignData(validData)).not.toThrow();
    });

    it('should throw error for invalid campaign data', () => {
      const invalidData = {
        campaign: '',
        adSpend: -100,
        sales: -500,
      };
      expect(() => validateCampaignData(invalidData)).toThrow(InventoryOptimizationError);
    });
  });

  describe('Trend Data Validation', () => {
    it('should validate correct trend data', () => {
      const validData = {
        previousPeriodSales: 1000,
        previousPeriodAdSpend: 200,
        industryAverageCTR: 2.5,
        industryAverageConversion: 3.0,
        seasonalityFactor: 1.2,
        marketTrend: 'rising',
        competitionLevel: 'medium',
      };
      expect(() => validateTrendData(validData)).not.toThrow();
    });

    it('should throw error for invalid trend data', () => {
      const invalidData = {
        previousPeriodSales: -1000,
        previousPeriodAdSpend: -200,
      };
      expect(() => validateTrendData(invalidData)).toThrow(InventoryOptimizationError);
    });
  });

  describe('Product Pricing Validation', () => {
    it('should validate correct product pricing data', () => {
      const validData = {
        cost: 50,
        targetMargin: 0.3,
        seasonalityFactor: 1.1,
        marketStrategy: 'premium',
      };
      expect(() => validateProductPricingData(validData)).not.toThrow();
    });

    it('should throw error for invalid product pricing data', () => {
      const invalidData = {
        cost: -50,
        targetMargin: -0.3,
      };
      expect(() => validateProductPricingData(invalidData)).toThrow(PricingOptimizationError);
    });
  });

  describe('Competitor Prices Validation', () => {
    it('should validate correct competitor prices', () => {
      const validPrices = [10, 20, 30, 40, 50];
      expect(() => validateCompetitorPrices(validPrices)).not.toThrow();
    });

    it('should throw error for invalid competitor prices', () => {
      const invalidPrices = [-10, 20, -30];
      expect(() => validateCompetitorPrices(invalidPrices)).toThrow(PricingOptimizationError);
    });
  });

  describe('String Sanitization', () => {
    it('should sanitize strings with HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello<p>World</p>';
      const sanitized = sanitizeString(input);
      expect(sanitized).toBe('scriptalert("xss")script/HellopWorld/p');
    });

    it('should remove control characters', () => {
      const input = 'Hello\u0000World\u001F';
      const sanitized = sanitizeString(input);
      expect(sanitized).toBe('HelloWorld');
    });
  });

  describe('CSRF Token Validation', () => {
    it('should validate matching CSRF tokens', () => {
      const token = 'valid-token';
      expect(() => validateCSRFToken(token, token)).not.toThrow();
    });

    it('should throw error for missing token', () => {
      expect(() => validateCSRFToken(undefined, 'token')).toThrow(SecurityError);
    });

    it('should throw error for mismatched tokens', () => {
      expect(() => validateCSRFToken('token1', 'token2')).toThrow(SecurityError);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      expect(() => checkRateLimit(50, Date.now() - 1000)).not.toThrow();
    });

    it('should throw error when rate limit exceeded', () => {
      expect(() => checkRateLimit(101, Date.now() - 1000)).toThrow(SecurityError);
    });
  });

  describe('Security Headers', () => {
    it('should return all required security headers', () => {
      const headers = getSecurityHeaders();
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-XSS-Protection');
      expect(headers).toHaveProperty('Strict-Transport-Security');
    });
  });
});
