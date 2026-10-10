import { Place, PlaceFilterOptions, CreatePlaceInput } from '../entities/Place';

/**
 * Domain-level repository interface.
 * Infrastructure implementations must satisfy this contract.
 */
export interface IPlaceRepository {
  getAll(filter?: PlaceFilterOptions): Promise<Place[]>;
  getById(id: string): Promise<Place | null>;
  search(options: PlaceFilterOptions): Promise<Place[]>;
  create(input: CreatePlaceInput): Promise<Place>;
  getSavedPlaces(savedIds: string[]): Promise<Place[]>;
  updateStatus(id: string, status: Place['status']): Promise<Place | null>;
  delete(id: string): Promise<boolean>;
}
