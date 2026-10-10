import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error-handling middleware.
 * Must be registered last in Express (4 parameters).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message || 'Internal Server Error';

  // Log unexpected errors
  if (statusCode >= 500) {
    console.error('🔥 Unhandled error:', err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: message,
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Invalid ID format',
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

/** Handles 404 routes not matched by any router. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
