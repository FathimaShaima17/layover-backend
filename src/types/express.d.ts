import 'express';

/**
 * Augments the Express Request type with the authenticated user
 * attached by the `authenticate` middleware.
 */
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      name: string;
    };
  }
}
