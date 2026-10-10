// Domain entity types – mirroring the frontend domain model exactly
// This is the single source of truth for place data shapes in the backend

export type PlaceType = 'hidden-gem' | 'famous-attraction';
export type PlaceStatus = 'pending' | 'approved' | 'rejected';
export type PlaceCategory =
  | 'nature'
  | 'beaches'
  | 'mountains'
  | 'history'
  | 'food'
  | 'culture'
  | 'hidden-gems'
  | 'attractions';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  story?: string;
  category: PlaceCategory;
  type: PlaceType;
  location: string;
  coordinates?: Coordinates;
  images: string[];
  bestTimeToVisit?: string;
  routeDescription?: string;
  accessibility?: string;
  tags: string[];
  status: PlaceStatus;
  createdAt: string;
  rating?: number;
  reviewsCount?: number;
  estimatedDuration?: string;
  nearbyLandmarks?: string[];
  submittedBy?: string;
}

export type CreatePlaceInput = Omit<Place, 'id' | 'createdAt' | 'status'>;

export type SortOption = 'newest' | 'alphabetical' | 'popular' | 'rating';

export interface PlaceFilterOptions {
  query?: string;
  category?: PlaceCategory | 'all';
  type?: PlaceType | 'all';
  status?: PlaceStatus;
  sortBy?: SortOption;
  tags?: string[];
}
