import { ToastUtils } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const ErrorCodes = {
  VALIDATION: 'VAL_001',
  API_FAILURE: 'API_002',
  AUTH: 'AUTH_001',
  RATE_LIMIT: 'RATE_001',
  UNKNOWN: 'GEN_001'
} as const;

export const ErrorMessages = {
  [ErrorCodes.VALIDATION]: 'Invalid input format',
  [ErrorCodes.API_FAILURE]: 'Service unavailable - please try again later',
  [ErrorCodes.AUTH]: 'Authentication required',
  [ErrorCodes.RATE_LIMIT]: 'Too many requests - please wait',
  [ErrorCodes.UNKNOWN]: 'An unexpected error occurred'
};

export function useErrorHandler() {
  const showError = (error: Error) => {
    const code = (error instanceof Error && 'errorCode' in error) 
    ? (error as CustomError).errorCode 
    : ErrorCodes.UNKNOWN;
    ToastUtils.error({
      title: 'Operation Failed',
      description: ErrorMessages[code] || error.message
    });
    console.error(`[${code}]`, error);
  };

  return { showError };
}

export function ErrorBoundaryWithMessage({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error: unknown) => {
        ToastUtils.error({
          title: 'Component Error',
          description: ('errorCode' in error) 
        ? ErrorMessages[(error as CustomError).errorCode] 
        : (error as Error).message
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Represents application-specific errors with error codes
 * @typedef {Object} CustomError
 * @property {string} errorCode - Unique error identifier from ErrorCodes
 */
type CustomError = Error & { errorCode: keyof typeof ErrorCodes };

export function handleError(error: unknown) {
  const normalizedError = error instanceof Error 
    ? error 
    : new Error(ErrorMessages[ErrorCodes.UNKNOWN]);
  
  return {
    error: normalizedError,
    code: ('errorCode' in normalizedError) 
    ? (normalizedError as CustomError).errorCode 
    : ErrorCodes.UNKNOWN,
    message: ('errorCode' in normalizedError) 
      ? ErrorMessages[normalizedError.errorCode as keyof typeof ErrorCodes]
      : normalizedError.message
  };
}