import type { SdgStats } from '../types/stats';
import { apiRequest } from './apiClient';

// SDG contributions of the completed visits between `from` and `to`
export function fetchSdgStats(from: Date, to: Date, signal?: AbortSignal) {
  const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
  return apiRequest<SdgStats>(`/visits/sdg-stats?${params}`, { signal });
}
