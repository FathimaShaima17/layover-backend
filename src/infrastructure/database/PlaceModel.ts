import mongoose, { Schema, Document } from 'mongoose';
import { Place, PlaceCategory, PlaceType, PlaceStatus } from '../../domain/entities/Place';

/**
 * Mongoose Document interface extends Place entity.
 * We use `_id` as Mongo's ObjectId but expose `id` to the domain layer.
 */
export interface PlaceDocument extends Omit<Place, 'id'>, Document {}

const CoordinatesSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const PlaceSchema = new Schema<PlaceDocument>(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
      maxlength: [200, 'Name must be 200 characters or fewer'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description must be 2000 characters or fewer'],
    },
    story: {
      type: String,
      trim: true,
      maxlength: [5000, 'Story must be 5000 characters or fewer'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['nature', 'beaches', 'mountains', 'history', 'food', 'culture', 'hidden-gems', 'attractions'] satisfies PlaceCategory[],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['hidden-gem', 'famous-attraction'] satisfies PlaceType[],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    coordinates: {
      type: CoordinatesSchema,
      required: false,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 10,
        message: 'A place can have at most 10 images',
      },
    },
    bestTimeToVisit: { type: String, trim: true },
    routeDescription: { type: String, trim: true },
    accessibility: { type: String, trim: true },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'] satisfies PlaceStatus[],
      default: 'pending',
    },
    rating: {
      type: Number,
      min: [0, 'Rating must be >= 0'],
      max: [5, 'Rating must be <= 5'],
    },
    reviewsCount: {
      type: Number,
      min: [0, 'Review count must be non-negative'],
      default: 0,
    },
    estimatedDuration: { type: String, trim: true },
    nearbyLandmarks: { type: [String], default: [] },
    submittedBy: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
      // Expose `id` as a string, and drop `__v`
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = String(ret['_id']);
        delete (ret as Record<string, unknown>)['_id'];
        delete (ret as Record<string, unknown>)['__v'];
        // Ensure createdAt is always ISO string
        const ca = ret['createdAt'];
        if (ca && typeof (ca as { toISOString?: unknown }).toISOString === 'function') {
          ret['createdAt'] = (ca as Date).toISOString();
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Text index for full-text search across name, description, location, tags, story
PlaceSchema.index(
  { name: 'text', description: 'text', location: 'text', story: 'text', tags: 'text' },
  { weights: { name: 10, tags: 5, location: 3, description: 2, story: 1 } }
);

// Compound indexes for common filter patterns
PlaceSchema.index({ status: 1, category: 1 });
PlaceSchema.index({ status: 1, type: 1 });
PlaceSchema.index({ createdAt: -1 });
PlaceSchema.index({ rating: -1 });

export const PlaceModel = mongoose.model<PlaceDocument>('Place', PlaceSchema);
