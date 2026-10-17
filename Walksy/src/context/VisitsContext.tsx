import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { ApiError } from '../services/apiClient';
import * as visitsApi from '../services/visitsApi';
import type { VisitAction } from '../services/visitsApi';
import type { NewVisit, Visit, VisitFeedback } from '../types/visit';
import { useAuth } from './AuthContext';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

type VisitsContextValue = {
  visits: Visit[];
  loadState: LoadState;
  errorCode: string | null;
  refresh: () => Promise<void>;
  createVisit: (visit: NewVisit) => Promise<Visit>;
  changeVisit: (id: string, action: VisitAction) => Promise<Visit>;
  // "Help Me"
  prepareHelp: (id: string) => Promise<Visit>;
  saveProgress: (id: string, completedSteps: number) => Promise<Visit>;
  completeVisit: (id: string) => Promise<Visit>;
  saveFeedback: (id: string, feedback: VisitFeedback) => Promise<Visit>;
};

const VisitsContext = createContext<VisitsContextValue | null>(null);

// the logged-in user's visits, loaded from the backend (database)
export function VisitsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadState('loading');
    try {
      setVisits(await visitsApi.fetchVisits());
      setErrorCode(null);
      setLoadState('ready');
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : 'unavailable');
      setLoadState('error');
    }
  }, []);

  // load after login, forget everything after logout
  useEffect(() => {
    if (status === 'signedIn') {
      refresh();
    } else if (status === 'signedOut') {
      setVisits([]);
      setLoadState('idle');
    }
  }, [status, refresh]);

  // replaces one visit in the list (or adds it), keeps the list sorted by start
  const upsert = useCallback((visit: Visit) => {
    setVisits((prev) =>
      [...prev.filter((item) => item.id !== visit.id), visit].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    );
    return visit;
  }, []);

  const createVisit = useCallback(async (visit: NewVisit) => upsert(await visitsApi.createVisit(visit)), [upsert]);

  const changeVisit = useCallback(
    async (id: string, action: VisitAction) => upsert(await visitsApi.changeVisit(id, action)),
    [upsert],
  );

  const prepareHelp = useCallback(async (id: string) => upsert(await visitsApi.prepareHelp(id)), [upsert]);

  const saveProgress = useCallback(
    async (id: string, completedSteps: number) => upsert(await visitsApi.saveProgress(id, completedSteps)),
    [upsert],
  );

  const completeVisit = useCallback(async (id: string) => upsert(await visitsApi.completeVisit(id)), [upsert]);

  const saveFeedback = useCallback(
    async (id: string, feedback: VisitFeedback) => upsert(await visitsApi.saveFeedback(id, feedback)),
    [upsert],
  );

  const value = useMemo(
    () => ({
      visits,
      loadState,
      errorCode,
      refresh,
      createVisit,
      changeVisit,
      prepareHelp,
      saveProgress,
      completeVisit,
      saveFeedback,
    }),
    [visits, loadState, errorCode, refresh, createVisit, changeVisit, prepareHelp, saveProgress, completeVisit, saveFeedback],
  );

  return <VisitsContext.Provider value={value}>{children}</VisitsContext.Provider>;
}

export function useVisits() {
  const context = useContext(VisitsContext);
  if (!context) throw new Error('useVisits must be used inside VisitsProvider');
  return context;
}
