import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Infrastructure
import { MongoPlaceRepository } from './infrastructure/repositories/MongoPlaceRepository';
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';

// Application use-cases
import {
  GetAllPlacesUseCase,
  GetPlaceByIdUseCase,
  SearchPlacesUseCase,
  CreatePlaceUseCase,
  GetSavedPlacesUseCase,
} from './application/use-cases/PlaceUseCases';
import {
  RegisterUseCase,
  LoginUseCase,
  GetProfileUseCase,
  UpdateProfileUseCase,
} from './application/use-cases/AuthUseCases';

// Presentation
import { PlaceController } from './presentation/controllers/PlaceController';
import { AuthController } from './presentation/controllers/AuthController';
import { createPlaceRouter } from './presentation/routes/placeRoutes';
import { createAuthRouter } from './presentation/routes/authRoutes';
import { errorHandler, notFoundHandler } from './presentation/middleware/errorHandler';

/**
 * Creates and configures the Express application.
 * Composition root: all dependencies are wired here.
 */
export function createApp(): express.Application {
  const app = express();

  // ─── Security & Logging ────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // ─── Body Parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Health Check ──────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── Dependency Injection (Composition Root) ───────────────────────────────
  const placeRepository = new MongoPlaceRepository();
  const userRepository = new MongoUserRepository();

  const getAllPlaces = new GetAllPlacesUseCase(placeRepository);
  const getPlaceById = new GetPlaceByIdUseCase(placeRepository);
  const searchPlaces = new SearchPlacesUseCase(placeRepository);
  const createPlace = new CreatePlaceUseCase(placeRepository);
  const getSavedPlaces = new GetSavedPlacesUseCase(placeRepository);

  const placeController = new PlaceController(
    getAllPlaces,
    getPlaceById,
    searchPlaces,
    createPlace,
    getSavedPlaces
  );

  const registerUser = new RegisterUseCase(userRepository);
  const loginUser = new LoginUseCase(userRepository);
  const getProfile = new GetProfileUseCase(userRepository);
  const updateProfile = new UpdateProfileUseCase(userRepository);

  const authController = new AuthController(
    registerUser,
    loginUser,
    getProfile,
    updateProfile
  );

  // ─── Routes ───────────────────────────────────────────────────────────────
  app.use('/api/places', createPlaceRouter(placeController));
  app.use('/api/auth', createAuthRouter(authController));

  // ─── Error Handling ────────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
