import { useEffect, useState } from 'react'; 

// current time that refreshes on an interval, so time-based UI (like visit status) stays correct
export function useNow(intervalMs = 60 * 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
