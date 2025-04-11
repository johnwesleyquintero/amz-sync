import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './amazon-errors';
import { Schema } from 'ajv';

interface ValidationOptions {
  strict?: boolean;
  additionalProperties?: boolean;
}

/**
 * Creates a middleware function that validates request data against a JSON schema.
 * @param schema - The JSON schema to validate against
 * @param target - The request property to validate ('body' | 'query' | 'params')
 * @param options - Validation options
 */
export function createValidationMiddleware(
  schema: Schema,
  target: 'body' | 'query' | 'params' = 'body',
  options: ValidationOptions = { strict: true, additionalProperties: false }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const Ajv = (await import('ajv')).default;
      const ajv = new Ajv({
        strict: options.strict,
        allErrors: true,
        removeAdditional: options.additionalProperties === false,
        useDefaults: true,
        coerceTypes: true,
      });

      const validate = ajv.compile(schema);
      const valid = validate(req[target]);

      if (!valid) {
        const errors = validate.errors?.map(err => {
          const path = err.instancePath || target;
          return `${path}: ${err.message}`;
        });

        throw new ValidationError('Validation failed', errors || ['Unknown validation error']);
      }

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.details,
        });
      } else {
        next(error);
      }
    }
  };
}
