import type { Place, PlacesErrorCode } from '../types/place';
import { ApiError, apiRequest } from './apiClient';

export const MIN_SEARCH_LENGTH = 3; // must match MIN_QUERY_LENGTH in the backend DTO

export class PlacesError extends Error {
  constructor(public readonly code: PlacesErrorCode) {
    super(code);
  }
}

const KNOWN_CODES: PlacesErrorCode[] = ['not_configured', 'rate_limited', 'unavailable', 'network'];

// Searches places through our backend (which asks LocationIQ).
export async function searchPlaces(query: string, language: string, signal: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({ q: query, lang: language.split('-')[0] });
  try {
    return await apiRequest<Place[]>(`/places/search?${params}`, { signal });
  } catch (error) {
    if (error instanceof ApiError) {
      throw new PlacesError(KNOWN_CODES.includes(error.code as PlacesErrorCode) ? (error.code as PlacesErrorCode) : 'unavailable');
    }
    throw error;
  }
}
