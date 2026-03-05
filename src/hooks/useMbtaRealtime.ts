import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MbtaPrediction {
  scheduledTime: string | null;
  predictedTime: string | null;
  delayMinutes: number;
  status: string; // "On Time" | "X min Late" | "CANCELLED"
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

  // Determine direction_id from routeId
  const directionId = routeId.includes('inbound') ? '1' : '0';

  const fetchPredictions = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-mbta', {
        body: null,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
      });

      // supabase.functions.invoke doesn't support query params well, so use fetch directly
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/fetch-mbta?stop=${encodeURIComponent(station)}&direction_id=${directionId}`;
      
      const res = await fetch(url, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const result = await res.json();
      if (result.predictions && result.predictions.length > 0) {
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
