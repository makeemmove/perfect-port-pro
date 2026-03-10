import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, ExternalLink, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface LotteryResult {
  id: string;
  game_name: string;
  draw_date: string;
  numbers: number[];
  special_number: number[] | null;
  multiplier: string | null;
  jackpot: string | null;
  official_url: string;
}

const GAME_CONFIG: Record<string, { accent: string; label: string }> = {
  'Powerball': { accent: '#dc2626', label: 'PB' },
  'Mega Millions': { accent: '#d97706', label: 'MB' },
  'Mass Cash': { accent: '#2563eb', label: '' },
  'Lucky for Life': { accent: '#16a34a', label: 'LB' },
  'Numbers Midday': { accent: '#7c3aed', label: '' },
  'Numbers Evening': { accent: '#7c3aed', label: '' },
};

// Top games shown by default
const TOP_GAMES = ['Powerball', 'Mega Millions'];

function formatDrawDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function NumberBall({ num, isSpecial, accent }: { num: number; isSpecial?: boolean; accent: string }) {
  if (num == null || isNaN(num)) return null;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-transform"
      style={{
        backgroundColor: isSpecial ? accent : '#ffffff',
        color: isSpecial ? '#ffffff' : '#1f2937',
        border: isSpecial ? 'none' : '1.5px solid #e5e7eb',
        boxShadow: isSpecial ? `0 2px 8px ${accent}40` : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {num}
    </div>
  );
}

function LotteryCard({ result }: { result: LotteryResult }) {
  const config = GAME_CONFIG[result.game_name] || { accent: '#6b7280', label: '' };

  return (
    <a
      href={result.official_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] cursor-pointer group"
      style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-bold" style={{ color: '#111827' }}>
            {result.game_name}
          </h3>
          <p className="text-[11px] font-medium" style={{ color: '#9ca3af' }}>
            {formatDrawDate(result.draw_date)}
          </p>
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

      {/* Numbers */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(result.numbers as number[]).map((num, i) => (
          <NumberBall key={`n-${i}`} num={num} accent={config.accent} />
        ))}
        {result.special_number && (result.special_number as number[]).filter(n => n != null && !isNaN(n)).map((num, i) => (
          <NumberBall key={`s-${i}`} num={num} isSpecial accent={config.accent} />
        ))}
      </div>

      {/* Multiplier */}
      {result.multiplier && (
        <div className="mt-2.5">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${config.accent}12`, color: config.accent }}>
            {result.multiplier}
          </span>
        </div>
      )}
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

const LotteryWidget = () => {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('draw_date', { ascending: false });

      if (!error && data && data.length > 0) {
        setResults(getLatestByGame(data));
        setLastUpdated(new Date());
      } else {
        try {
          await supabase.functions.invoke('fetch-lottery');
          const { data: fresh } = await supabase
            .from('lottery_results')
            .select('*')
            .order('draw_date', { ascending: false });
          if (fresh) setResults(getLatestByGame(fresh));
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
            if (data) { setResults(getLatestByGame(data)); setLastUpdated(new Date()); }
          });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const gameOrder = ['Powerball', 'Mega Millions', 'Mass Cash', 'Lucky for Life', 'Numbers Midday', 'Numbers Evening'];
  const sorted = [...results].sort((a, b) => {
    const ai = gameOrder.indexOf(a.game_name);
    const bi = gameOrder.indexOf(b.game_name);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const topResults = sorted.filter(r => TOP_GAMES.includes(r.game_name));
  const otherResults = sorted.filter(r => !TOP_GAMES.includes(r.game_name));

  return (
    <div className="glass-card p-6 py-[15px]">
      {/* Header */}
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
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-8 text-[13px] text-muted-foreground">
          No lottery results available yet. Results will appear after the next draw.
        </div>
      ) : (
        <>
          {/* Top games (Powerball & Mega Millions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topResults.map((result) => (
              <LotteryCard key={result.id} result={result} />
            ))}
          </div>

          {/* See All toggle */}
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
                    <LotteryCard key={result.id} result={result} />
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
