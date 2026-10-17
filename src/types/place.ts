// keep in sync with api/src/places/place.types.ts (until we have a shared package)
export type PlaceCategory = 'bank' | 'hospital' | 'pharmacy' | 'government' | 'shop' | 'post' | 'other';

export type Place = {
  id: string;
  name: string;
  address: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
};

export type PlacesErrorCode = 'not_configured' | 'rate_limited' | 'unavailable' | 'network';
