import { ToastUtils } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import React from 'react'; // Import React if not already implicitly available in your setup for JSX

// Define specific error codes for better categorization
export const ErrorCodes = {
  VALIDATION: 'VAL_001',
  API_FAILURE: 'API_002',
  AUTH: 'AUTH_001',
  RATE_LIMIT: 'RATE_001',
  NOT_FOUND: 'NF_001', // Added for clarity
  DATA_PROCESSING: 'DATA_001', // Added for clarity
  UNKNOWN: 'GEN_001',
} as const;

// Type for the keys of ErrorCodes
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// User-friendly messages corresponding to error codes
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.VALIDATION]: 'Invalid input provided. Please check your data.',
  [ErrorCodes.API_FAILURE]: 'Service temporarily unavailable. Please try again later.',
  [ErrorCodes.AUTH]: 'Authentication failed or required. Please log in.',
  [ErrorCodes.RATE_LIMIT]: 'Too many requests. Please wait a moment before trying again.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource could not be found.',
  [ErrorCodes.DATA_PROCESSING]: 'There was an issue processing the data.',
  [ErrorCodes.UNKNOWN]:
    'An unexpected error occurred. Please contact support if the issue persists.',
};

/**
 * Represents application-specific errors with error codes.
 * Ensures that custom errors always have an errorCode.
 */
export class CustomError extends Error {
  public readonly errorCode: ErrorCode;

  constructor(message: string, errorCode: ErrorCode = ErrorCodes.UNKNOWN) {
    super(message);
    this.name = 'CustomError';
    this.errorCode = errorCode;
    // Ensure the prototype chain is set correctly
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// Helper function to check if an error is a CustomError
function isCustomError(error: unknown): error is CustomError {
  return error instanceof CustomError || (error instanceof Error && 'errorCode' in error);
}

/**
 * Custom hook for displaying standardized error notifications.
 */
export function useErrorHandler() {
  const showError = (error: unknown, defaultCode: ErrorCode = ErrorCodes.UNKNOWN) => {
    let code: ErrorCode = defaultCode;
    let message: string;

    if (isCustomError(error)) {
      code = error.errorCode;
      // Use the specific message from the error if available, otherwise fallback to standard message
      message = error.message || ErrorMessages[code] || ErrorMessages[ErrorCodes.UNKNOWN];
    } else if (error instanceof Error) {
      // For generic errors, use the error's message but keep the code as UNKNOWN or default
      message = error.message || ErrorMessages[code];
    } else {
      // For non-Error types thrown
      message = ErrorMessages[code];
    }

    ToastUtils.error({
      title: 'Operation Failed',
      description: message,
    });

    // Log the original error for debugging
    console.error(`[Error Code: ${code}]`, error);
  };

  return { showError };
}

/**
 * An ErrorBoundary component that uses the standardized toast notifications.
 */
export function ErrorBoundaryWithMessage({ children }: { children: React.ReactNode }) {
  const { showError } = useErrorHandler();

  return (
    <ErrorBoundary
      onError={(error: unknown /*, errorInfo: React.ErrorInfo */) => {
        // Log errorInfo if needed for more context: console.error("ErrorBoundary caught:", error, errorInfo);
        showError(error, ErrorCodes.UNKNOWN); // Use the hook to display the error
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Normalizes various error types into a consistent structure.
 * @param error The error object (can be anything).
 * @param defaultCode The default error code if none is found.
 * @returns An object containing the normalized error, code, and message.
 */
export function handleError(
  error: unknown,
  defaultCode: ErrorCode = ErrorCodes.UNKNOWN
): { error: Error; code: ErrorCode; message: string } {
  let normalizedError: Error;
  let code: ErrorCode = defaultCode;
  let message: string;

  if (isCustomError(error)) {
    normalizedError = error;
    code = error.errorCode;
    message = error.message || ErrorMessages[code] || ErrorMessages[ErrorCodes.UNKNOWN];
  } else if (error instanceof Error) {
    normalizedError = error;
    // Attempt to find a matching code based on message content (optional, can be fragile)
    // e.g., if (error.message.includes('fetch failed')) code = ErrorCodes.API_FAILURE;
    message = error.message || ErrorMessages[code]; // Use default code if no specific match
  } else {
    // Handle cases where non-Error objects are thrown
    normalizedError = new CustomError(String(error), code);
    message = normalizedError.message || ErrorMessages[code];
  }

  // Ensure message is never empty
  if (!message) {
    message = ErrorMessages[code] || ErrorMessages[ErrorCodes.UNKNOWN];
  }

  return {
    error: normalizedError,
    code: code,
    message: message,
  };
}
