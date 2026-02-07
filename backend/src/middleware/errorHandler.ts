import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ErrorIds } from '../constants/errorIds.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.statusCode : 500;
  const errorId = isAppError && err.code ? err.code : ErrorIds.INTERNAL_ERROR;

  // In production, don't expose internal error details to clients
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const message = isAppError
    ? err.message
    : isDevelopment
      ? err.message || 'Internal Server Error'
      : 'An unexpected error occurred. Please try again.';

  // Structured error logging with context for debugging
  logger.error('Request error', {
    errorId,
    status,
    path: req.path,
    method: req.method,
    requestId: req.id,
    userId: (req as { user?: { id?: string } }).user?.id,
    userAgent: req.get('user-agent'),
  }, err);

  // Include error ID in response for support correlation
  res.status(status).json({
    error: message,
    errorId,
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId: req.id,
  });
}
