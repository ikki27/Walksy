import { useEffect, useRef, useState } from 'react';

import { MIN_SEARCH_LENGTH, PlacesError, searchPlaces } from '../services/placesApi';
import type { Place, PlacesErrorCode } from '../types/place';
import { useDebouncedValue } from './useDebouncedValue';

// wait this long after the last key press, so we don't search on every letter
const SEARCH_DELAY_MS = 400;

type SearchState =
  | { status: 'idle' } // nothing typed (or too short)
  | { status: 'loading' }
  | { status: 'done'; results: Place[] }
  | { status: 'error'; code: PlacesErrorCode };

export function usePlaceSearch(query: string, language: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DELAY_MS);
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  // results already fetched in this session, so going back to a query is instant
  const cacheRef = useRef(new Map<string, Place[]>());

  const isTyping = query.trim() !== debouncedQuery;
  const searchable = debouncedQuery.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (!searchable) {
      setState({ status: 'idle' });
      return;
    }

    const key = `${language}:${debouncedQuery.toLowerCase()}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      setState({ status: 'done', results: cached });
      return;
    }

    // a newer search cancels the older one, so old results never overwrite new ones
    const abort = new AbortController();
    setState({ status: 'loading' });

    searchPlaces(debouncedQuery, language, abort.signal)
      .then((results) => {
        cacheRef.current.set(key, results);
        setState({ status: 'done', results });
      })
      .catch((error) => {
        if (abort.signal.aborted) return;
        setState({ status: 'error', code: error instanceof PlacesError ? error.code : 'unavailable' });
      });

    return () => abort.abort();
  }, [debouncedQuery, language, searchable]);

  // while the person is still typing a searchable query, show the loading state right away
  const visibleState: SearchState = isTyping && query.trim().length >= MIN_SEARCH_LENGTH ? { status: 'loading' } : state;

  return { ...visibleState, active: query.trim().length > 0 };
}
