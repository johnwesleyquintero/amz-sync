import { ValidationError, AggregateError } from './amazon-errors';

type DataType = 'string' | 'number' | 'date' | 'boolean';

interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

interface ColumnTransform {
  transform: (value: unknown) => unknown;
  description: string;
}

interface ColumnDefinition {
  dataType: DataType;
  required?: boolean;
  format?: RegExp;
  min?: number;
  max?: number;
  allowedValues?: string[];
  rules?: ValidationRule[];
  transforms?: ColumnTransform[];
  description?: string;
}

export interface CsvSchemaDefinition {
  name: string;
  version: string;
  description: string;
  strictMode?: boolean;
  columns: Record<string, ColumnDefinition>;
}

export class CsvSchemaValidator {
  private schema: CsvSchemaDefinition;
  private errors: ValidationError[] = [];
  private transformedData: Record<string, unknown>[] = [];

  constructor(schema: CsvSchemaDefinition) {
    this.schema = schema;
  }

  private validateDataType(value: unknown, dataType: DataType): boolean {
    if (value === null || value === undefined || value === '') return true;

    switch (dataType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return !isNaN(Number(value));
      case 'date':
        return !isNaN(new Date(String(value)).getTime());
      case 'boolean':
        return (
          typeof value === 'boolean' ||
          ['true', 'false', '0', '1'].includes(String(value).toLowerCase())
        );
      default:
        return false;
    }
  }

  private transformValue(value: unknown, transforms: ColumnTransform[]): unknown {
    return transforms.reduce((acc, { transform }) => transform(acc), value);
  }

  private validateColumn(
    value: unknown,
    column: string,
    def: ColumnDefinition,
    rowIndex: number
  ): void {
    // Required check
    if (def.required && (value === null || value === undefined || value === '')) {
      this.errors.push(
        new ValidationError(`Missing required value for ${column} at row ${rowIndex + 1}`)
      );
      return;
    }

    if (value === null || value === undefined || value === '') return;

    // Data type validation
    if (!this.validateDataType(value, def.dataType)) {
      this.errors.push(
        new ValidationError(`Invalid ${def.dataType} format for ${column} at row ${rowIndex + 1}`)
      );
      return;
    }

    // Format validation
    if (def.format && !def.format.test(String(value))) {
      this.errors.push(new ValidationError(`Format mismatch for ${column} at row ${rowIndex + 1}`));
    }

    // Range validation for numbers
    if (def.dataType === 'number') {
      const numValue = Number(value);
      if (def.min !== undefined && numValue < def.min) {
        this.errors.push(
          new ValidationError(`${column} value too low at row ${rowIndex + 1} (min ${def.min})`)
        );
      }
      if (def.max !== undefined && numValue > def.max) {
        this.errors.push(
          new ValidationError(`${column} value too high at row ${rowIndex + 1} (max ${def.max})`)
        );
      }
    }

    // Allowed values validation
    if (def.allowedValues && !def.allowedValues.includes(String(value))) {
      this.errors.push(new ValidationError(`Invalid value for ${column} at row ${rowIndex + 1}`));
    }

    // Custom validation rules
    if (def.rules) {
      def.rules.forEach(rule => {
        if (!rule.validate(value)) {
          this.errors.push(
            new ValidationError(`${rule.message} for ${column} at row ${rowIndex + 1}`)
          );
        }
      });
    }
  }

  validate(data: Record<string, unknown>[]): Record<string, unknown>[] {
    this.errors = [];
    this.transformedData = [];

    // Validate schema structure
    if (!this.schema.columns || Object.keys(this.schema.columns).length === 0) {
      throw new ValidationError('Invalid schema: no columns defined');
    }

    data.forEach((row, rowIndex) => {
      const transformedRow: Record<string, unknown> = {};

      // Strict mode validation
      if (this.schema.strictMode) {
        Object.keys(row).forEach(column => {
          if (!this.schema.columns[column]) {
            this.errors.push(
              new ValidationError(
                `Unexpected column '${column}' at row ${rowIndex + 1} in strict mode`
              )
            );
          }
        });
      }

      // Validate each column
      Object.entries(this.schema.columns).forEach(([column, def]) => {
        let value = row[column];

        // Apply transforms if defined
        if (def.transforms && value !== null && value !== undefined) {
          try {
            value = this.transformValue(value, def.transforms);
          } catch (error) {
            this.errors.push(
              new ValidationError(
                `Transform failed for ${column} at row ${rowIndex + 1}: ${error.message}`
              )
            );
            return;
          }
        }

        this.validateColumn(value, column, def, rowIndex);
        transformedRow[column] = value;
      });

      this.transformedData.push(transformedRow);
    });

    if (this.errors.length > 0) {
      throw new AggregateError(this.errors, 'CSV validation failed');
    }

    return this.transformedData;
  }

  getValidationErrors(): ValidationError[] {
    return this.errors;
  }
}
