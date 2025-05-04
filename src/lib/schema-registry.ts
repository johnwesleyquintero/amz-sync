import { CsvSchemaDefinition } from './schema-validation';

const ACOS_SCHEMA: CsvSchemaDefinition = {
  name: 'ACOS Report Schema',
  version: '1.0.0',
  description: 'Schema for validating ACOS (Advertising Cost of Sales) report data',
  strictMode: true,
  columns: {
    'Campaign Name': {
      dataType: 'string',
      required: true,
      description: 'Name of the advertising campaign',
    },
    'Ad Group': {
      dataType: 'string',
      required: true,
      description: 'Name of the ad group',
    },
    Impressions: {
      dataType: 'number',
      required: true,
      min: 0,
      format: /^\d+$/,
      description: 'Number of ad impressions',
    },
    Clicks: {
      dataType: 'number',
      required: true,
      min: 0,
      format: /^\d+$/,
      description: 'Number of ad clicks',
    },
    CTR: {
      dataType: 'number',
      required: true,
      min: 0,
      max: 100,
      transforms: [
        {
          transform: value => Number(String(value).replace('%', '')),
          description: 'Remove percentage sign and convert to number',
        },
      ],
      description: 'Click-through rate percentage',
    },
    CPC: {
      dataType: 'number',
      required: true,
      min: 0,
      transforms: [
        {
          transform: value => Number(String(value).replace('$', '')),
          description: 'Remove dollar sign and convert to number',
        },
      ],
      description: 'Cost per click',
    },
    Spend: {
      dataType: 'number',
      required: true,
      min: 0,
      transforms: [
        {
          transform: value => Number(String(value).replace('$', '')),
          description: 'Remove dollar sign and convert to number',
        },
      ],
      description: 'Total ad spend',
    },
    Sales: {
      dataType: 'number',
      required: true,
      min: 0,
      transforms: [
        {
          transform: value => Number(String(value).replace('$', '')),
          description: 'Remove dollar sign and convert to number',
        },
      ],
      description: 'Total sales amount',
    },
    ACOS: {
      dataType: 'number',
      required: true,
      min: 0,
      transforms: [
        {
          transform: value => Number(String(value).replace('%', '')),
          description: 'Remove percentage sign and convert to number',
        },
      ],
      description: 'Advertising Cost of Sales percentage',
    },
    Date: {
      dataType: 'date',
      required: true,
      format: /^\d{4}-\d{2}-\d{2}$/,
      description: 'Report date',
    },
  },
};

const PRODUCT_LISTING_SCHEMA: CsvSchemaDefinition = {
  name: 'Product Listing Schema',
  version: '1.0.0',
  description: 'Schema for validating product listing data',
  strictMode: true,
  columns: {
    ASIN: {
      dataType: 'string',
      required: true,
      format: /^[A-Z0-9]{10}$/,
      description: 'Amazon Standard Identification Number',
    },
    Title: {
      dataType: 'string',
      required: true,
      rules: [
        {
          validate: value => String(value).length <= 200,
          message: 'Title must not exceed 200 characters',
        },
      ],
      description: 'Product title',
    },
    Price: {
      dataType: 'number',
      required: true,
      min: 0,
      transforms: [
        {
          transform: value => Number(String(value).replace('$', '')),
          description: 'Remove dollar sign and convert to number',
        },
      ],
      description: 'Product price',
    },
    Category: {
      dataType: 'string',
      required: true,
      description: 'Product category',
    },
    Rating: {
      dataType: 'number',
      required: true,
      min: 1,
      max: 5,
      description: 'Product rating',
    },
    'Review Count': {
      dataType: 'number',
      required: true,
      min: 0,
      description: 'Number of product reviews',
    },
    'Stock Status': {
      dataType: 'string',
      required: true,
      allowedValues: ['In Stock', 'Out of Stock', 'Limited Stock'],
      description: 'Product stock status',
    },
  },
};

export const schemaRegistry = {
  ACOS_SCHEMA,
  PRODUCT_LISTING_SCHEMA,
  // Add more schemas as needed
} as const;

export type SchemaKey = keyof typeof schemaRegistry;

export function getSchema(key: SchemaKey): CsvSchemaDefinition {
  return schemaRegistry[key];
}

export function validateSchemaKey(key: string): key is SchemaKey {
  return key in schemaRegistry;
}
