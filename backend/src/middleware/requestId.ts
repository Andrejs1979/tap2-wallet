import { type Request, type Response, type NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

declare module 'express' {
  export interface Request {
    id?: string;
  }
}

/**
 * Request ID middleware
 *
 * Generates or extracts a unique request ID for tracing requests through the system.
 * The ID is included in response headers and logs for correlation.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  // Use existing request ID from header or generate a new one
  req.id = req.get('x-request-id') || randomUUID();

  // Include request ID in response header for client-side correlation
  res.setHeader('x-request-id', req.id);

  next();
}
