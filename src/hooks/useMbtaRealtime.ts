import { useState, useEffect, useCallback, useRef } from 'react';

export interface MbtaPrediction {
  scheduledTime: string | null;
  predictedTime: string | null;
  delayMinutes: number;
  status: string;
  direction: string;
  tripId: string;
}

interface UseMbtaRealtimeResult {
  predictions: MbtaPrediction[];
  isLive: boolean;
  error: string | null;
}

export function useMbtaRealtime(station: string, routeId: string): UseMbtaRealtimeResult {
  const [predictions, setPredictions] = useState<MbtaPrediction[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const directionId = routeId.includes('inbound') ? '1' : '0';

  const fetchPredictions = useCallback(async () => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/fetch-mbta?stop=${encodeURIComponent(station)}&direction_id=${directionId}`;
      
      const res = await fetch(url, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const result = await res.json();
      if (result.predictions?.length > 0) {
        setPredictions(result.predictions);
        setIsLive(true);
        setError(null);
      } else {
        setPredictions([]);
        setIsLive(false);
      }
    } catch (e) {
      console.error('MBTA realtime fetch error:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
      setIsLive(false);
    }
  }, [station, directionId]);

  useEffect(() => {
    fetchPredictions();
    intervalRef.current = setInterval(fetchPredictions, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPredictions]);

  return { predictions, isLive, error };
}
