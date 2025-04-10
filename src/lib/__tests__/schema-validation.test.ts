import { describe, it, expect } from 'vitest';
import { CsvSchemaValidator } from '../schema-validation';
import { schemaRegistry } from '../schema-registry';

describe('CsvSchemaValidator', () => {
  describe('ACOS Schema Validation', () => {
    const validator = new CsvSchemaValidator(schemaRegistry.ACOS_SCHEMA);

    it('should validate correct ACOS data', () => {
      const validData = [
        {
          'Campaign Name': 'Test Campaign',
          'Ad Group': 'Test Group',
          Impressions: '1000',
          Clicks: '50',
          CTR: '5%',
          CPC: '$0.50',
          Spend: '$25.00',
          Sales: '$100.00',
          ACOS: '25%',
          Date: '2024-01-15',
        },
      ];

      const result = validator.validate(validData);
      expect(result).toHaveLength(1);
      expect(result[0].CTR).toBe(5); // Transformed from '5%' to 5
      expect(result[0].CPC).toBe(0.5); // Transformed from '$0.50' to 0.5
    });

    it('should reject invalid ACOS data', () => {
      const invalidData = [
        {
          'Campaign Name': 'Test Campaign',
          'Ad Group': 'Test Group',
          Impressions: '-1000', // Invalid negative value
          Clicks: 'invalid',
          CTR: '150%', // Invalid percentage
          CPC: 'invalid',
          Spend: '-25.00',
          Sales: 'invalid',
          ACOS: '200%',
          Date: 'invalid-date',
        },
      ];

      expect(() => validator.validate(invalidData)).toThrow('CSV validation failed');
      const errors = validator.getValidationErrors();
      expect(errors).toHaveLength(8); // Should have multiple validation errors
    });
  });

  describe('Product Listing Schema Validation', () => {
    const validator = new CsvSchemaValidator(schemaRegistry.PRODUCT_LISTING_SCHEMA);

    it('should validate correct product listing data', () => {
      const validData = [
        {
          ASIN: 'B01ABCDEFG',
          Title: 'Test Product',
          Price: '$29.99',
          Category: 'Electronics',
          Rating: '4.5',
          'Review Count': '100',
          'Stock Status': 'In Stock',
        },
      ];

      const result = validator.validate(validData);
      expect(result).toHaveLength(1);
      expect(result[0].Price).toBe(29.99); // Transformed from '$29.99' to 29.99
    });

    it('should reject invalid product listing data', () => {
      const invalidData = [
        {
          ASIN: 'invalid', // Invalid ASIN format
          Title: 'A'.repeat(201), // Title too long
          Price: '-29.99', // Negative price
          Category: '',
          Rating: '6', // Invalid rating
          'Review Count': '-1', // Invalid negative value
          'Stock Status': 'Unknown', // Invalid status
        },
      ];

      expect(() => validator.validate(invalidData)).toThrow('CSV validation failed');
      const errors = validator.getValidationErrors();
      expect(errors).toHaveLength(7); // Should have multiple validation errors
    });
  });

  describe('Schema Validation Edge Cases', () => {
    const validator = new CsvSchemaValidator(schemaRegistry.ACOS_SCHEMA);

    it('should handle empty data array', () => {
      const result = validator.validate([]);
      expect(result).toHaveLength(0);
    });

    it('should handle null and undefined values', () => {
      const data = [
        {
          'Campaign Name': null,
          'Ad Group': undefined,
          Impressions: '',
          Clicks: '0',
          CTR: '0%',
          CPC: '$0.00',
          Spend: '$0.00',
          Sales: '$0.00',
          ACOS: '0%',
          Date: '2024-01-15',
        },
      ];

      expect(() => validator.validate(data)).toThrow('CSV validation failed');
      const errors = validator.getValidationErrors();
      expect(errors.some(e => e.message.includes('required'))).toBe(true);
    });

    it('should handle data transformation edge cases', () => {
      const data = [
        {
          'Campaign Name': 'Test Campaign',
          'Ad Group': 'Test Group',
          Impressions: '1000',
          Clicks: '50',
          CTR: '0.001%', // Very small percentage
          CPC: '$0.001', // Very small amount
          Spend: '$0.00',
          Sales: '$0.00',
          ACOS: '0%',
          Date: '2024-01-15',
        },
      ];

      const result = validator.validate(data);
      expect(result).toHaveLength(1);
      expect(result[0].CTR).toBe(0.001);
      expect(result[0].CPC).toBe(0.001);
    });
  });
});
