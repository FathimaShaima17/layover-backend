import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../infrastructure/config/env';

/**
 * JWT authentication middleware.
 *
 * Reads `Authorization: Bearer <token>`, verifies the signature
 * and attaches `{ id, email, name }` to `req.user`.
 * Responds 401 when the header is missing or the token is invalid.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Provide an Authorization: Bearer <token> header.',
    });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, jwtConfig.secret) as {
      sub: string;
      email?: string;
      name?: string;
    };

    req.user = {
      id: payload.sub,
      email: payload.email ?? '',
      name: payload.name ?? '',
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}
