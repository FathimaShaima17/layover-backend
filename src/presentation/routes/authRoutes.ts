import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * Builds the /api/auth router.
 *
 * POST   /api/auth/register  – create an account
 * POST   /api/auth/login     – sign in, receive JWT
 * GET    /api/auth/me        – current user profile (protected)
 * PATCH  /api/auth/profile   – update profile (protected)
 */
export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', authenticate, controller.me);
  router.patch('/profile', authenticate, controller.patchProfile);

  return router;
}
