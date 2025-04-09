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
    const code = (error as any).errorCode || ErrorCodes.UNKNOWN;
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
      onError={(error) => 
        ToastUtils.error({
          title: 'Component Error',
          description: ErrorMessages[(error as any).errorCode] || error.message
        })
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function handleError(error: unknown) {
  const normalizedError = error instanceof Error 
    ? error 
    : new Error(ErrorMessages[ErrorCodes.UNKNOWN]);
  
  return {
    error: normalizedError,
    code: (normalizedError as any).errorCode || ErrorCodes.UNKNOWN,
    message: ErrorMessages[(normalizedError as any).errorCode] || normalizedError.message
  };
}