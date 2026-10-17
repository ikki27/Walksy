import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TtlCache } from '../common/ttl-cache';
import { toPlaceCategory } from './place-category';
import type { PlaceResult, PlacesErrorCode } from './place.types';

const AUTOCOMPLETE_URL = 'https://api.locationiq.com/v1/autocomplete';
const COUNTRY_CODES = 'si'; 
const RESULT_LIMIT = 10;
const REQUEST_TIMEOUT_MS = 8000;

const SUPPORTED_LANGUAGES = ['en', 'cs', 'nl', 'fr', 'de', 'id', 'it', 'no', 'pl', 'es', 'ru', 'sv', 'uk'];

type LocationIqResult = {
  place_id: string;
  lat: string;
  lon: string;
  class?: string;
  type?: string;
  display_name: string;
  display_place?: string;
  display_address?: string;
};

class PlacesNotConfiguredError extends Error {}
class PlacesRateLimitError extends Error {}

@Injectable()
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);
  private readonly apiKey: string | undefined;
  private readonly cache = new TtlCache<PlaceResult[]>(24 * 60 * 60 * 1000, 1000);

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('LOCATIONIQ_API_KEY') || undefined;
    if (!this.apiKey) this.logger.warn('LOCATIONIQ_API_KEY is not set, place search is disabled');
  }

  async search(query: string, lang: string | undefined): Promise<PlaceResult[]> {
    if (!this.apiKey) throw new PlacesNotConfiguredError();

    const language = lang && SUPPORTED_LANGUAGES.includes(lang.split('-')[0]) ? lang.split('-')[0] : 'native';
    const cacheKey = `${language}:${query.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      key: this.apiKey,
      q: query,
      countrycodes: COUNTRY_CODES,
      limit: String(RESULT_LIMIT),
      'accept-language': language,
      normalizecity: '1',
      dedupe: '1',
    });

    const response = await fetch(`${AUTOCOMPLETE_URL}?${params}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 404) return this.remember(cacheKey, []);
    if (response.status === 429) throw new PlacesRateLimitError();
    if (!response.ok) throw new Error(`LocationIQ responded ${response.status}`);

    const data = (await response.json()) as LocationIqResult[];
    return this.remember(cacheKey, data.map(toPlaceResult));
  }

  toErrorCode(error: unknown): PlacesErrorCode {
    if (error instanceof PlacesNotConfiguredError) return 'not_configured';
    if (error instanceof PlacesRateLimitError) return 'rate_limited';

    this.logger.error('Place search failed', error instanceof Error ? error.stack : String(error));
    return 'unavailable';
  }

  private remember(key: string, results: PlaceResult[]): PlaceResult[] {
    this.cache.set(key, results);
    return results;
  }
}

function toPlaceResult(item: LocationIqResult): PlaceResult {

  const [firstPart, ...rest] = item.display_name.split(', ');

  return {
    id: item.place_id,
    name: item.display_place || firstPart,
    address: item.display_address || rest.join(', '),
    category: toPlaceCategory(item.class, item.type),
    lat: Number(item.lat),
    lng: Number(item.lon),
  };
}
