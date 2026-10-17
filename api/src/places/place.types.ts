// keep in sync with Walksy/src/types/place.ts (until we have a shared package)
export const PLACE_CATEGORIES = ['bank', 'hospital', 'pharmacy', 'government', 'shop', 'post', 'other'] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

// one search result, in the small shape the app needs
export type PlaceResult = {
  id: string;
  name: string;
  address: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
};

export type PlacesErrorCode = 'not_configured' | 'rate_limited' | 'unavailable';
