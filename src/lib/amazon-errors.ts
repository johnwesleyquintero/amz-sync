import { ZodIssue } from 'zod';

export class AggregateError extends Error {
  constructor(
    message: string,
    public errors: Error[]
  ) {
    super(message);
    this.name = 'AggregateError';
  }
}

export class AmazonAPIError extends Error {
  readonly errorCode: string;
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AmazonAPIError';
    this.errorCode = 'API_001';
  }
}

export class ValidationError extends Error {
  readonly errorCode: string;
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    this.errorCode = 'VAL_001';
  }
}

export class RateLimitError extends Error {
  readonly errorCode: string;
  constructor(
    message: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
    this.errorCode = 'RATE_001';
  }
}

export class AuthenticationError extends Error {
  readonly errorCode: string;
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    this.errorCode = 'AUTH_001';
  }
}

export class InventoryOptimizationError extends Error {
  readonly errorCode: string;
  readonly details: ZodIssue[];

  constructor(message: string, issues: ZodIssue[]) {
    super(message);
    this.name = 'InventoryOptimizationError';
    this.errorCode = 'INVENTORY_001';
    this.details = issues;
  }
}

export class PricingOptimizationError extends Error {
  readonly errorCode: string;
  readonly historicalData?: number[];

  constructor(message: string, historicalData?: number[]) {
    super(message);
    this.name = 'PricingOptimizationError';
    this.errorCode = 'PRICING_002';
    this.historicalData = historicalData;
  }
}

export class SecurityError extends Error {
  readonly errorCode: string;
  constructor(
    message: string,
    public securityType?: string
  ) {
    super(message);
    this.name = 'SecurityError';
    this.errorCode = 'SEC_001';
  }
}

export class DataProcessingError extends Error {
  readonly errorCode: string;
  constructor(
    message: string,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DataProcessingError';
    this.errorCode = 'DATA_001';
  }
}
