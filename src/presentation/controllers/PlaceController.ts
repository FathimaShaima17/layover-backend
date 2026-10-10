import { Request, Response, NextFunction } from 'express';
import {
  GetAllPlacesUseCase,
  GetPlaceByIdUseCase,
  SearchPlacesUseCase,
  CreatePlaceUseCase,
  GetSavedPlacesUseCase,
} from '../../application/use-cases/PlaceUseCases';
import { PlaceFilterOptions, CreatePlaceInput, PlaceCategory, PlaceType, PlaceStatus, SortOption } from '../../domain/entities/Place';

/**
 * PlaceController
 *
 * Presentation layer — handles HTTP request/response lifecycle.
 * Delegates all business logic to use-case classes.
 */
export class PlaceController {
  constructor(
    private readonly getAllPlaces: GetAllPlacesUseCase,
    private readonly getPlaceById: GetPlaceByIdUseCase,
    private readonly searchPlaces: SearchPlacesUseCase,
    private readonly createPlace: CreatePlaceUseCase,
    private readonly getSavedPlaces: GetSavedPlacesUseCase
  ) {}

  // GET /api/places
  listPlaces = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter: PlaceFilterOptions = {
        query: req.query.q as string | undefined,
        category: req.query.category as PlaceCategory | 'all' | undefined,
        type: req.query.type as PlaceType | 'all' | undefined,
        status: req.query.status as PlaceStatus | undefined,
        sortBy: req.query.sortBy as SortOption | undefined,
        tags: req.query.tags
          ? String(req.query.tags).split(',').map((t) => t.trim())
          : undefined,
      };

      const places = await this.getAllPlaces.execute(filter);
      res.json({ success: true, data: places, count: places.length });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/places/search
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options: PlaceFilterOptions = {
        query: req.query.q as string | undefined,
        category: req.query.category as PlaceCategory | 'all' | undefined,
        type: req.query.type as PlaceType | 'all' | undefined,
        sortBy: req.query.sortBy as SortOption | undefined,
        tags: req.query.tags
          ? String(req.query.tags).split(',').map((t) => t.trim())
          : undefined,
      };

      const places = await this.searchPlaces.execute(options);
      res.json({ success: true, data: places, count: places.length });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/places/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const place = await this.getPlaceById.execute(String(req.params['id']));
      if (!place) {
        res.status(404).json({ success: false, error: 'Place not found' });
        return;
      }
      res.json({ success: true, data: place });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/places
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreatePlaceInput = req.body as CreatePlaceInput;
      // Attribute the submission to the authenticated explorer
      if (!input.submittedBy && req.user?.name) {
        input.submittedBy = req.user.name;
      }
      const place = await this.createPlace.execute(input);
      res.status(201).json({ success: true, data: place });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/places/saved
  // Body: { ids: string[] }
  saved = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ids: string[] = Array.isArray(req.body.ids) ? req.body.ids : [];
      const places = await this.getSavedPlaces.execute(ids);
      res.json({ success: true, data: places, count: places.length });
    } catch (err) {
      next(err);
    }
  };
}
