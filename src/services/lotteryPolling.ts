import { supabase } from '@/integrations/supabase/client';

type ScheduleConfig = {
  id: string;
  hour: number;
  minute: number;
  daysOfWeek: number[]; // 0 = Sunday
};

// All refresh times are set for approximately 2 minutes after the published draw time (local browser time).
const LOTTERY_SCHEDULES: ScheduleConfig[] = [
  // Daily high-frequency draws
  {
    id: 'numbers-masscash-midday',
    hour: 14, // Numbers Game (Midday) & Mass Cash (Midday) · 2:02 PM
    minute: 2,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'numbers-masscash-evening',
    hour: 21, // Numbers Game (Eve) & Mass Cash (Eve) · 9:02 PM
    minute: 2,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },

  // Evening jackpot draws
  {
    id: 'megabucks',
    hour: 21, // Megabucks · 9:02 PM (9:00 draw)
    minute: 2,
    daysOfWeek: [1, 3, 6], // Mon, Wed, Sat
  },
  {
    id: 'millionaire-for-life',
    hour: 23, // Millionaire for Life · 11:17 PM (11:15 draw)
    minute: 17,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // draws most days; safe to poll daily
  },
  {
    id: 'powerball-evening',
    hour: 23, // Powerball · 11:01 PM (10:59 draw)
    minute: 1,
    daysOfWeek: [1, 3, 6], // Mon, Wed, Sat
  },
  {
    id: 'mega-millions-evening',
    hour: 23, // Mega Millions · 11:02 PM (11:00 draw)
    minute: 2,
    daysOfWeek: [2, 5], // Tue, Fri
  },
];

function getNextOccurrence(from: Date, schedule: ScheduleConfig): Date {
  const next = new Date(from);
  next.setSeconds(0, 0);
  next.setHours(schedule.hour, schedule.minute, 0, 0);

  const fromDay = from.getDay();

  // If today is a valid day but time has already passed, or today is not valid, advance to the next valid day.
  let daysToAdd = 0;
  if (!schedule.daysOfWeek.includes(fromDay) || next <= from) {
    for (let i = 1; i <= 7; i++) {
      const candidateDay = (fromDay + i) % 7;
      if (schedule.daysOfWeek.includes(candidateDay)) {
        daysToAdd = i;
        break;
      }
    }
  }

  if (daysToAdd > 0) {
    next.setDate(next.getDate() + daysToAdd);
  }

  return next;
}

function getNextScheduledRun(from: Date): Date {
  let best: Date | null = null;

  for (const schedule of LOTTERY_SCHEDULES) {
    const next = getNextOccurrence(from, schedule);
    if (!best || next < best) {
      best = next;
    }
  }

  // Fallback: run in 5 minutes if something goes wrong computing times
  return best ?? new Date(from.getTime() + 5 * 60_000);
}

/**
 * Fetches lottery data only at the scheduled draw times (no API/polling at other times).
 *
 * When the app is open, at each scheduled time this will:
 * - Invoke the `fetch-lottery` Edge Function (server cron also runs at these times)
 * - Retry every 60 seconds for up to 5 minutes so we catch the draw once it's posted
 *
 * Returns a cleanup function that cancels all timers.
 */
export function startLotteryPolling() {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let timeoutId: number | null = null;
  let retryIntervalId: number | null = null;

  const clearAllTimers = () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (retryIntervalId !== null) {
      window.clearInterval(retryIntervalId);
      retryIntervalId = null;
    }
  };

  const scheduleNextWindow = () => {
    const now = new Date();
    const nextRun = getNextScheduledRun(now);
    const delay = Math.max(0, nextRun.getTime() - now.getTime());

    timeoutId = window.setTimeout(async () => {
      let attempts = 0;
      const maxAttempts = 6;

      const invokeFetch = async () => {
        attempts += 1;
        try {
          await supabase.functions.invoke('fetch-lottery');
        } catch (err) {
          console.error('Lottery fetch at draw time failed', err);
        }

        if (attempts >= maxAttempts && retryIntervalId !== null) {
          window.clearInterval(retryIntervalId);
          retryIntervalId = null;
          scheduleNextWindow();
        }
      };

      await invokeFetch();

      retryIntervalId = window.setInterval(() => {
        void invokeFetch();
      }, 60_000);
    }, delay);
  };

  scheduleNextWindow();

  return () => {
    clearAllTimers();
  };
}

