import { CsvSchema, csvSchemas } from './validation-utils';
import { ValidationError, AggregateError } from './amazon-errors';

export function generateExportFilename(toolName: string, format: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${toolName.replace(/ /g, '-')}_${date}.${format.toLowerCase()}`;
}

export function parseCsvValue(value: string, schemaType?: 'string' | 'number' | 'date'): unknown {
  if (schemaType === 'number') {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  }
  if (schemaType === 'date') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date;
  }
  return value.trim();
}

export function validateCsvAgainstSchema(
  data: any[],
  headers: string[],
  schema: CsvSchema
): void {
  const errors: ValidationError[] = [];

  // Validate headers first
  const schemaColumns = Object.keys(schema.columns);
  if (schema.strictMode) {
    headers.forEach(header => {
      if (!schemaColumns.includes(header)) {
        errors.push(new ValidationError(`Unexpected column: ${header}`));
      }
    });
  }

  schemaColumns.forEach(column => {
    if (schema.columns[column].required && !headers.includes(column)) {
      errors.push(new ValidationError(`Missing required column: ${column}`));
    }
  });

  // Validate rows if header checks passed
  if (errors.length === 0) {
    data.forEach((row, rowIndex) => {
      schemaColumns.forEach(column => {
        const value = row[column];
        const def = schema.columns[column];

        if (def.required && (value === null || value === undefined || value === '')) {
          errors.push(new ValidationError(`Missing required value for ${column} at row ${rowIndex + 1}`));
        }

        if (value !== null && value !== undefined && value !== '') {
          // Type validation
          const parsed = parseCsvValue(String(value), def.dataType);
          if (typeof parsed !== def.dataType && def.dataType === 'number' && isNaN(parsed)) {
            errors.push(new ValidationError(`Invalid number format for ${column} at row ${rowIndex + 1}`));
          }

          // Format validation
          if (def.format && !def.format.test(String(value))) {
            errors.push(new ValidationError(`Format mismatch for ${column} at row ${rowIndex + 1}`));
          }

          // Value constraints
          if (typeof def.min === 'number' && Number(value) < def.min) {
            errors.push(new ValidationError(`${column} value too low at row ${rowIndex + 1} (min ${def.min})`));
          }
          if (typeof def.max === 'number' && Number(value) > def.max) {
            errors.push(new ValidationError(`${column} value too high at row ${rowIndex + 1} (max ${def.max})`));
          }

          // Allowed values
          if (def.allowedValues && !def.allowedValues.includes(String(value))) {
            errors.push(new ValidationError(`Invalid value for ${column} at row ${rowIndex + 1}`));
          }
        }
      });
    });
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, 'CSV validation failed');
  }
}

export function parseCsvData(csvText: string, schemaType: keyof typeof csvSchemas): any[] {
  const schema = csvSchemas[schemaType];
  const rows = csvText.split('\n').filter(line => line.trim());
  const headers = rows.shift()?.split(',').map(h => h.trim()) || [];
  
  const data = rows.map((row, index) => {
    const values = row.split(',');
    return headers.reduce((obj, header, i) => {
      obj[header] = parseCsvValue(values[i], schema.columns[header]?.dataType);
      return obj;
    }, {} as any);
  });

  validateCsvAgainstSchema(data, headers, schema);
  return data;
}