import { IPlaceRepository } from '../../domain/repositories/IPlaceRepository';
import {
  Place,
  PlaceFilterOptions,
  CreatePlaceInput,
  SortOption,
} from '../../domain/entities/Place';
import { PlaceModel, PlaceDocument } from '../database/PlaceModel';

/**
 * MongoDB implementation of IPlaceRepository using Mongoose.
 * All methods return plain domain objects (not Mongoose documents).
 */
export class MongoPlaceRepository implements IPlaceRepository {
  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Converts a Mongoose document to a plain domain Place object. */
  private toPlace(doc: PlaceDocument): Place {
    return doc.toJSON() as unknown as Place;
  }

  /** Builds a Mongoose sort object from the domain SortOption enum. */
  private buildSort(sortBy?: SortOption): Record<string, 1 | -1> {
    switch (sortBy) {
      case 'newest':
        return { createdAt: -1 };
      case 'alphabetical':
        return { name: 1 };
      case 'popular':
      case 'rating':
        return { rating: -1, reviewsCount: -1 };
      default:
        return { createdAt: -1 }; // default: most recent first
    }
  }

  /** Builds a Mongoose filter query from PlaceFilterOptions. */
  private buildQuery(filter?: PlaceFilterOptions): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query['status'] = filter.status;
    }

    if (filter?.category && filter.category !== 'all') {
      query['category'] = filter.category;
    }

    if (filter?.type && filter.type !== 'all') {
      query['type'] = filter.type;
    }

    if (filter?.tags && filter.tags.length > 0) {
      query['tags'] = { $in: filter.tags };
    }

    if (filter?.query && filter.query.trim()) {
      // Use MongoDB $text search (requires text index) for full-text search
      query['$text'] = { $search: filter.query.trim() };
    }

    return query;
  }

  // ---------------------------------------------------------------------------
  // IPlaceRepository implementation
  // ---------------------------------------------------------------------------

  async getAll(filter?: PlaceFilterOptions): Promise<Place[]> {
    const query = this.buildQuery(filter);
    const sort = this.buildSort(filter?.sortBy);

    const docs = await PlaceModel.find(query).sort(sort).lean({ virtuals: true });
    return docs.map((doc) => {
      const d = { ...doc, id: (doc._id as object).toString() } as unknown as Place;
      // Ensure createdAt is ISO string
      const ca = d.createdAt as unknown;
      if (ca && typeof (ca as { toISOString?: unknown }).toISOString === 'function') {
        d.createdAt = (ca as Date).toISOString();
      }
      return d;
    });
  }

  async getById(id: string): Promise<Place | null> {
    const doc = await PlaceModel.findById(id);
    if (!doc) return null;
    return this.toPlace(doc);
  }

  async search(options: PlaceFilterOptions): Promise<Place[]> {
    return this.getAll(options);
  }

  async create(input: CreatePlaceInput): Promise<Place> {
    const doc = await PlaceModel.create({
      ...input,
      status: 'approved', // Auto-approved for live 3D world prototype
    });
    return this.toPlace(doc);
  }

  async getSavedPlaces(savedIds: string[]): Promise<Place[]> {
    if (!savedIds || savedIds.length === 0) return [];

    const docs = await PlaceModel.find({ _id: { $in: savedIds } }).lean({ virtuals: true });
    return docs.map((doc) => {
      const d = { ...doc, id: (doc._id as object).toString() } as unknown as Place;
      const ca = d.createdAt as unknown;
      if (ca && typeof (ca as { toISOString?: unknown }).toISOString === 'function') {
        d.createdAt = (ca as Date).toISOString();
      }
      return d;
    });
  }

  async updateStatus(id: string, status: Place['status']): Promise<Place | null> {
    const doc = await PlaceModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!doc) return null;
    return this.toPlace(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await PlaceModel.findByIdAndDelete(id);
    return result !== null;
  }
}
