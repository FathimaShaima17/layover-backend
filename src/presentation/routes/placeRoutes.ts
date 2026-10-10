import { Router } from 'express';
import { PlaceController } from '../controllers/PlaceController';
import { authenticate } from '../middleware/authMiddleware';

/**
 * Builds the /api/places router.
 * All route handlers are bound methods on PlaceController.
 */
export function createPlaceRouter(controller: PlaceController): Router {
  const router = Router();

  // GET /api/places          – list with filters
  router.get('/', controller.listPlaces);

  // GET /api/places/search   – full-text search (before /:id to avoid conflict)
  router.get('/search', controller.search);

  // POST /api/places/saved   – resolve saved IDs to full place objects
  router.post('/saved', controller.saved);

  // GET /api/places/:id      – single place detail
  router.get('/:id', controller.getById);

  // POST /api/places         – submit a new place (authenticated)
  router.post('/', authenticate, controller.create);

  return router;
}
