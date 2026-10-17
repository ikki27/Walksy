import { useCallback, useMemo, useState } from 'react';

import type { VisitTiming } from '../types/visit';
import { clampToLimits, getDefaultStart, getTimingLimits, getVisitAction } from '../utils/visitSchedule';
import { useNow } from './useNow';

// state of the "When is your visit?" form
export function useVisitSchedule() {
  const now = useNow(30 * 1000); // "now" moves, so limits and the button stay correct
  const [timing, setTimingState] = useState<VisitTiming>('now');
  const [pickedStart, setPickedStart] = useState<Date>(() => getDefaultStart('now', new Date()));
  const [notifyPlace, setNotifyPlace] = useState(false);
  const [rideRequested, setRideRequested] = useState(false);

  const limits = useMemo(() => getTimingLimits(timing, now), [timing, now]);
  // "now" always means this moment; other answers keep the picked date, within the limits
  const startsAt = timing === 'now' ? now : clampToLimits(pickedStart, limits);
  const action = getVisitAction(startsAt, now);

  const setTiming = useCallback((next: VisitTiming) => {
    setTimingState(next);
    setPickedStart(getDefaultStart(next, new Date()));
  }, []);

  return {
    timing,
    setTiming,
    startsAt,
    setStartsAt: setPickedStart,
    limits,
    action,
    notifyPlace,
    setNotifyPlace,
    rideRequested,
    toggleRide: () => setRideRequested((value) => !value),
  };
}
