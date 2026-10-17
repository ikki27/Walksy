import { useEffect, useMemo, useState } from 'react';

import { useVisits } from '../context/VisitsContext';
import { ApiError } from '../services/apiClient';
import { fetchSdgStats } from '../services/statsApi';
import type { SdgStats } from '../types/stats';

type StatsState =
  | { status: 'loading' }
  | { status: 'ready'; stats: SdgStats }
  | { status: 'error'; code: string };

// calendar month in the phone's local time: 0 = this month, -1 = last month, ...
export function getMonthRange(monthOffset: number, now = new Date()) {
  const from = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 1);
  return { from, to };
}

export function useSdgStats(monthOffset: number) {
  const { visits } = useVisits();
  const [state, setState] = useState<StatsState>({ status: 'loading' });
  const { from, to } = useMemo(() => getMonthRange(monthOffset), [monthOffset]);
  // load again when a visit changes (e.g. one was just completed)
  const visitsVersion = visits.map((visit) => `${visit.id}:${visit.status}`).join(',');

  useEffect(() => {
    const abort = new AbortController();
    setState({ status: 'loading' });

    fetchSdgStats(from, to, abort.signal)
      .then((stats) => setState({ status: 'ready', stats }))
      .catch((error) => {
        if (abort.signal.aborted) return;
        setState({ status: 'error', code: error instanceof ApiError ? error.code : 'unavailable' });
      });

    return () => abort.abort();
  }, [from, to, visitsVersion]);

  return { ...state, from };
}
