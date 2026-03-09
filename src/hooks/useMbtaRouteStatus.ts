import { useState, useEffect, useCallback, useRef } from 'react';

export interface StopPrediction {
  stopId: string;
  stopName: string;
  scheduledTime: string | null;
  predictedTime: string | null;
  delayMinutes: number;
  status: string;
  direction: string;
  tripId: string;
}

interface UseMbtaRouteStatusResult {
  stopPredictions: StopPrediction[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useMbtaRouteStatus(directionId?: string): UseMbtaRouteStatusResult {
  const [stopPredictions, setStopPredictions] = useState<StopPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      let url = `https://${projectId}.supabase.co/functions/v1/fetch-mbta?mode=route`;
      if (directionId !== undefined) {
        url += `&direction_id=${directionId}`;
      }

      const res = await fetch(url, {
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const result = await res.json();
      setStopPredictions(result.stopPredictions || []);
      setError(null);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('MBTA route status fetch error:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [directionId]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
    intervalRef.current = setInterval(fetchData, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  return { stopPredictions, isLoading, error, lastUpdated };
}
