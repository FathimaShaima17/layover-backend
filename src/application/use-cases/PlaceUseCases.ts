import { IPlaceRepository } from '../../domain/repositories/IPlaceRepository';
import {
  Place,
  PlaceFilterOptions,
  CreatePlaceInput,
} from '../../domain/entities/Place';

/**
 * GetAllPlacesUseCase
 *
 * Retrieves places matching the given filters.
 * By default, only returns approved places for public browsing.
 */
export class GetAllPlacesUseCase {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async execute(filter?: PlaceFilterOptions): Promise<Place[]> {
    // Default to approved places only for public API
    const effectiveFilter: PlaceFilterOptions = {
      status: 'approved',
      ...filter,
    };
    return this.placeRepository.getAll(effectiveFilter);
  }
}

/**
 * GetPlaceByIdUseCase
 *
 * Retrieves a single place by its unique ID.
 */
export class GetPlaceByIdUseCase {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async execute(id: string): Promise<Place | null> {
    return this.placeRepository.getById(id);
  }
}

/**
 * SearchPlacesUseCase
 *
 * Full-text and faceted search. Always scoped to approved places.
 */
export class SearchPlacesUseCase {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async execute(options: PlaceFilterOptions): Promise<Place[]> {
    return this.placeRepository.search({ status: 'approved', ...options });
  }
}

/**
 * CreatePlaceUseCase
 *
 * Validates and persists a new place submission.
 * New submissions are always set to `pending` status.
 */
export class CreatePlaceUseCase {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async execute(input: CreatePlaceInput): Promise<Place> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Place name is required');
    }
    if (!input.description || input.description.trim().length === 0) {
      throw new Error('Place description is required');
    }
    if (!input.location || input.location.trim().length === 0) {
      throw new Error('Place location is required');
    }
    if (!input.category) {
      throw new Error('Place category is required');
    }
    if (!input.type) {
      throw new Error('Place type is required');
    }

    return this.placeRepository.create(input);
  }
}

/**
 * GetSavedPlacesUseCase
 *
 * Returns the full place documents for a list of saved IDs.
 * Used to hydrate a user's bookmarks.
 */
export class GetSavedPlacesUseCase {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async execute(savedIds: string[]): Promise<Place[]> {
    return this.placeRepository.getSavedPlaces(savedIds);
  }
}
