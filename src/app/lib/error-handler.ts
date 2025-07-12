import { NextResponse } from "next/server";

// Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, "VALIDATION_ERROR", true);
    this.field = field;
  }

  public field?: string;
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND", true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED", true);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_EXCEEDED", true);
  }
}

// Error response interface
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    details?: unknown;
  };
}

// Error logging utility
export class ErrorLogger {
  static log(error: Error, context?: Record<string, unknown>): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      ...(error instanceof AppError && {
        statusCode: error.statusCode,
        code: error.code,
        isOperational: error.isOperational,
      }),
    };

    // In production, you would send this to a logging service
    if (process.env.NODE_ENV === "production") {
      // Send to logging service (Sentry, LogRocket, etc.)
      console.error("[ERROR]", JSON.stringify(errorInfo));
    } else {
      console.error("[ERROR]", errorInfo);
    }
  }
}

// Main error handler for API routes
export function handleApiError(
  error: unknown,
  path?: string
): NextResponse<ErrorResponse> {
  let appError: AppError;

  // Convert unknown errors to AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError(
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
      500,
      "INTERNAL_ERROR"
    );
  } else {
    appError = new AppError(
      "An unexpected error occurred",
      500,
      "UNKNOWN_ERROR"
    );
  }

  // Log the error
  ErrorLogger.log(appError, { path });

  // Create error response
  const errorResponse: ErrorResponse = {
    error: {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      timestamp: new Date().toISOString(),
      path,
      ...(process.env.NODE_ENV !== "production" && {
        details: error instanceof Error ? error.stack : error,
      }),
    },
  };

  return NextResponse.json(errorResponse, {
    status: appError.statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// React error boundary hook
export function useErrorHandler() {
  return {
    handleError: (error: Error, errorInfo?: { componentStack: string }) => {
      ErrorLogger.log(error, {
        type: "REACT_ERROR",
        componentStack: errorInfo?.componentStack,
      });
    },
  };
}

// Async operation wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    ErrorLogger.log(
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    throw error;
  }
}

// Type guard for operational errors
export function isOperationalError(error: unknown): error is AppError {
  return error instanceof AppError && error.isOperational;
}

// Error sanitizer for client-side errors
export function sanitizeError(error: unknown): {
  message: string;
  code: string;
} {
  if (error instanceof AppError && error.isOperational) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
}
