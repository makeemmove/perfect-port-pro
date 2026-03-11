import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, ExternalLink, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { startLotteryPolling } from '@/services/lotteryPolling';

interface LotteryResult {
  id: string;
  game_name: string;
  draw_date: string;
  numbers: number[];
  special_number: number[] | null;
  multiplier: string | null;
  jackpot: string | null;
  official_url: string;
  placeholder?: boolean;
}

interface LotteryWidgetProps {
  compact?: boolean;
  onSeeAll?: () => void;
  showHistory?: boolean;
}

const GAME_CONFIG: Record<string, { accent: string; label: string }> = {
  'Powerball': { accent: '#dc2626', label: 'PB' },
  'Mega Millions': { accent: '#d97706', label: 'MB' },
  'Mass Cash Midday': { accent: '#2563eb', label: '' },
  'Mass Cash Evening': { accent: '#2563eb', label: '' },
  'Millionaire for Life': { accent: '#16a34a', label: 'ML' },
  'Megabucks': { accent: '#0ea5e9', label: '' },
  'Numbers Midday': { accent: '#7c3aed', label: '' },
  'Numbers Evening': { accent: '#7c3aed', label: '' },
  'Keno': { accent: '#f97316', label: '' },
};

const TOP_GAMES = ['Powerball'];

const DISPLAY_GAMES = [
  'Powerball',
  'Mega Millions',
  'Mass Cash Midday',
  'Mass Cash Evening',
  'Millionaire for Life',
  'Megabucks',
  'Numbers Midday',
  'Numbers Evening',
  'Keno',
];

function formatDrawDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function isDrawToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

/** Normalize numbers from DB (JSON may be number[] or string[] or mixed) to number[]. */
function toNumberArray(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map((n) => (typeof n === 'number' && !isNaN(n) ? n : Number(n))).filter((n) => !isNaN(n));
  }
  if (typeof value === 'string') {
    const parts = value.split(/[\s,\-]+/).filter(Boolean);
    const nums = parts.map(Number).filter((n) => !isNaN(n));
    if (nums.length > 0) return nums;
    // Single string of digits with no separators (e.g. "1234") -> split into digits
    if (/^\d{3,4}$/.test(value.trim())) {
      return value.trim().split('').map(Number);
    }
    return [];
  }
  if (typeof value === 'number' && !isNaN(value) && Number.isInteger(value)) {
    // DB sometimes stores Numbers Game as a single number (e.g. 1234)
    const s = String(value);
    if (s.length >= 3 && s.length <= 4) return s.split('').map(Number);
    return [value];
  }
  return [];
}

function NumberBall({ num, isSpecial, accent }: { num: number; isSpecial?: boolean; accent: string }) {
  if (num == null || isNaN(num)) return null;
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-transform"
      style={{
        backgroundColor: isSpecial ? accent : '#ffffff',
        color: isSpecial ? '#ffffff' : '#1f2937',
        border: '1px solid #e5e7eb',
        boxShadow: isSpecial ? `0 2px 8px ${accent}40` : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {num}
    </div>
  );
}

function LotteryCard({ result, isFromToday }: { result: LotteryResult; isFromToday?: boolean }) {
  const config = GAME_CONFIG[result.game_name] || { accent: '#6b7280', label: '' };

  const isNumbersMidday = result.game_name === 'Numbers Midday';
  const isNumbersEvening = result.game_name === 'Numbers Evening';
  const isMassCashMidday = result.game_name === 'Mass Cash Midday';
  const isMassCashEvening = result.game_name === 'Mass Cash Evening';
  const isPlaceholder = result.placeholder;

  let displayName = result.game_name;
  let icon: string | null = null;

  if (isNumbersMidday) {
    displayName = 'The Numbers Game – Midday';
    icon = '☀️';
  } else if (isNumbersEvening) {
    displayName = 'The Numbers Game – Evening';
    icon = '🌙';
  } else if (isMassCashMidday) {
    displayName = 'Mass Cash – Midday';
    icon = '☀️';
  } else if (isMassCashEvening) {
    displayName = 'Mass Cash – Evening';
    icon = '🌙';
  }

  // If no draw today, we show the latest draw (already chosen as todayLatest || overallLatest).
  const dateLabel = isPlaceholder
    ? 'Awaiting this week\'s draw'
    : isFromToday
      ? `Today · ${formatDrawDate(result.draw_date)}`
      : `Last draw · ${formatDrawDate(result.draw_date)}`;

  return (
    <a
      href={result.official_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] cursor-pointer group"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 8px 20px rgba(0,0,0,0.03)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-bold flex items-center gap-1.5" style={{ color: '#111827' }}>
            {icon && <span aria-hidden="true">{icon}</span>}
            <span>{displayName}</span>
          </h3>
          <p className="text-[11px] font-medium" style={{ color: '#9ca3af' }}>
            {dateLabel}
          </p>
          {(isNumbersMidday || isNumbersEvening) && (
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>
              {toNumberArray(result.numbers).length === 3 ? '3-digit win' : '4-digit win'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {result.jackpot && (
            <span className="text-[12px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${config.accent}15`, color: config.accent }}>
              {result.jackpot}
            </span>
          )}
          <ExternalLink
            className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity"
            style={{ color: '#9ca3af' }}
          />
        </div>
      </div>

      {result.game_name === 'Keno' ? (
        <div className="mt-1 grid grid-cols-5 gap-1.5">
          {toNumberArray(result.numbers).slice(0, 20).map((num, i) => (
            <div
              key={`k-${i}`}
              className="h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{
                backgroundColor: '#ffffff',
                color: '#111827',
                border: '1px solid #e5e7eb',
              }}
            >
              {num}
            </div>
          ))}
        </div>
      ) : isPlaceholder ? (
        <div className="mt-1 text-[11px] text-gray-400">
          Numbers will appear here after this week&apos;s draw is posted.
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Main numbers (white balls) - same style as Powerball */}
          {toNumberArray(result.numbers).map((num, i) => (
            <NumberBall key={`n-${i}`} num={num} accent={config.accent} />
          ))}
          {/* Special/Power/Mega ball - visually separated like Powerball */}
          {result.special_number && toNumberArray(result.special_number).length > 0 && (
            <>
              <span className="w-1 shrink-0" aria-hidden="true" />
              {toNumberArray(result.special_number).map((num, i) => (
                <NumberBall key={`s-${i}`} num={num} isSpecial accent={config.accent} />
              ))}
            </>
          )}
        </div>
      )}

      {result.multiplier && (
        <div className="mt-2.5">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${config.accent}12`, color: config.accent }}>
            {result.multiplier}
          </span>
        </div>
      )}

      <div className="mt-3 text-[11px] font-medium flex items-center justify-between text-gray-400">
        <span>Drawn by the Massachusetts Lottery</span>
        <span className="underline">View official results</span>
      </div>
    </a>
  );
}

function getLatestByGame(data: any[]): LotteryResult[] {
  const map = new Map<string, any>();
  for (const r of data) {
    if (!map.has(r.game_name)) map.set(r.game_name, r);
  }
  return Array.from(map.values()) as LotteryResult[];
}

const LotteryWidget = ({ compact = false, onSeeAll, showHistory = false }: LotteryWidgetProps) => {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showAll, setShowAll] = useState(false);
  const hasTriggeredFetchForPlaceholders = useRef(false);

  // High-precision polling around draw times to ping the scraper / sheet.
  useEffect(() => {
    const stop = startLotteryPolling();
    return () => {
      stop();
    };
  }, []);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('draw_date', { ascending: false });

      if (!error && data && data.length > 0) {
        setResults(data as LotteryResult[]);
        setLastUpdated(new Date());
      } else {
        try {
          await supabase.functions.invoke('fetch-lottery');
          const { data: fresh } = await supabase
            .from('lottery_results')
            .select('*')
            .order('draw_date', { ascending: false });
          if (fresh) setResults(fresh as LotteryResult[]);
        } catch (e) {
          console.error('Failed to fetch lottery:', e);
        }
      }
      setIsLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('lottery-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => {
        supabase.from('lottery_results').select('*').order('draw_date', { ascending: false })
          .then(({ data }) => {
            if (data) {
              setResults(data as LotteryResult[]);
              setLastUpdated(new Date());
            }
          });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // When on full Lottery tab, if any game has no results (placeholder), trigger fetch once to load latest draws
  useEffect(() => {
    if (!showHistory || isLoading || hasTriggeredFetchForPlaceholders.current || results.length === 0) return;
    const gameNames = new Set(results.map((r) => r.game_name));
    const missing = DISPLAY_GAMES.some((name) => !gameNames.has(name));
    if (!missing) return;
    hasTriggeredFetchForPlaceholders.current = true;
    (async () => {
      try {
        await supabase.functions.invoke('fetch-lottery');
        const { data } = await supabase.from('lottery_results').select('*').order('draw_date', { ascending: false });
        if (data) {
          setResults(data as LotteryResult[]);
          setLastUpdated(new Date());
        }
      } catch (e) {
        console.error('Lottery refresh for placeholders:', e);
      }
    })();
  }, [showHistory, isLoading, results.length]);

  const gameOrder = [
    'Powerball',
    'Mega Millions',
    'Mass Cash Midday',
    'Mass Cash Evening',
    'Millionaire for Life',
    'Megabucks',
    'Numbers Midday',
    'Numbers Evening',
    'Keno',
  ];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Today's draws only (for "has it happened today?").
  const todayResults = results.filter((r) => {
    const d = new Date(r.draw_date);
    return !isNaN(d.getTime()) && d >= startOfToday;
  });

  // Build per-game: latest overall (any time), and latest from today if any.
  const latestOverallByGame = new Map<string, LotteryResult>();
  for (const r of results) {
    if (!latestOverallByGame.has(r.game_name)) {
      latestOverallByGame.set(r.game_name, r);
    }
  }

  const latestTodayByGame = new Map<string, LotteryResult>();
  for (const r of todayResults) {
    if (!latestTodayByGame.has(r.game_name)) {
      latestTodayByGame.set(r.game_name, r);
    }
  }

  const sortByGameThenDate = (list: LotteryResult[]) => {
    const copy = [...list];
    copy.sort((a, b) => {
    const ai = gameOrder.indexOf(a.game_name);
    const bi = gameOrder.indexOf(b.game_name);
    const gi = ai === -1 ? 99 : ai;
    const gj = bi === -1 ? 99 : bi;
    if (gi !== gj) return gi - gj;

    const da = new Date(a.draw_date).getTime();
    const db = new Date(b.draw_date).getTime();
    return db - da;
    });
    return copy;
  };

  const overallList = sortByGameThenDate(Array.from(latestOverallByGame.values()));
  const hasAnyResults = overallList.length > 0;

  const topResults = overallList.filter(r => TOP_GAMES.includes(r.game_name));
  const otherResults = overallList.filter(r => !TOP_GAMES.includes(r.game_name));

  // In compact mode on the Home tab, only show top games + See All button.
  const displayResults = compact ? topResults : overallList;

  return (
    <div className="glass-card p-6 py-[15px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
          <Trophy className="w-4 h-4" style={{ color: '#d97706' }} />
        </div>
        <span className="text-[9px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ backgroundColor: '#fef3c710', color: '#d97706' }}>
          MA Lottery Results
        </span>
        {lastUpdated && (
          <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/60">
            <RefreshCw className="w-2.5 h-2.5" />
            {lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : !hasAnyResults ? (
        <div className="text-center py-8 text-[13px] text-muted-foreground">
          No lottery results available yet. Results will appear after the next draw.
        </div>
      ) : compact ? (
        // Home tab snapshot: just the top jackpot games.
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topResults.map((result) => (
              <LotteryCard key={result.id} result={result} isFromToday={!result.placeholder && isDrawToday(result.draw_date)} />
            ))}
          </div>
          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="mt-3 w-full text-[12px] font-semibold flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all duration-200 hover:bg-muted/30"
              style={{ color: '#d97706' }}
            >
              See All Games
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      ) : showHistory ? (
        // Full Lottery tab: show all games. Prefer today's draw; if none, show last draw and date.
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DISPLAY_GAMES.map((gameName) => {
            const todayLatest = latestTodayByGame.get(gameName);
            const overallLatest = latestOverallByGame.get(gameName);
            const existing = todayLatest || overallLatest;
            const result: LotteryResult =
              existing ?? {
                id: `placeholder-${gameName}`,
                game_name: gameName,
                draw_date: new Date().toISOString(),
                numbers: [],
                special_number: null,
                multiplier: null,
                jackpot: null,
                official_url: 'https://www.masslottery.com/',
                placeholder: true,
              };
            const isFromToday = !result.placeholder && todayLatest?.game_name === gameName;
            return <LotteryCard key={result.id} result={result} isFromToday={isFromToday} />;
          })}
        </div>
      ) : (
        // Non-compact, non-history fallback (not used today, kept for flexibility).
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topResults.map((result) => (
              <LotteryCard key={result.id} result={result} isFromToday={!result.placeholder && isDrawToday(result.draw_date)} />
            ))}
          </div>

          {otherResults.length > 0 && (
            <>
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-3 w-full text-[12px] font-semibold flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all duration-200 hover:bg-muted/30"
                style={{ color: '#d97706' }}
              >
                {showAll ? 'Show Less' : `See All Games (${otherResults.length} more)`}
                {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAll && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 animate-fade-in">
                  {otherResults.map((result) => (
                    <LotteryCard key={result.id} result={result} isFromToday={!result.placeholder && isDrawToday(result.draw_date)} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className="text-[10px] text-muted-foreground/50 mt-3 text-center">
        Updates automatically · Data from official sources
      </div>
    </div>
  );
};

export default LotteryWidget;
