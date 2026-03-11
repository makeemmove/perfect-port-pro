import LotteryWidget from './widgets/LotteryWidget';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface KenoResult {
  id: string;
  game_name: string;
  draw_date: string;
  numbers: number[];
  official_url: string;
}

interface MegabucksResult {
  id: string;
  game_name: string;
  draw_date: string;
  numbers: unknown;
  special_number: unknown;
  official_url: string;
}

const GAME_SCHEDULE = [
  {
    game: 'The Numbers Game (Midday)',
    drawDays: 'Daily',
    drawTime: '2:00 PM',
  },
  {
    game: 'The Numbers Game (Evening)',
    drawDays: 'Daily',
    drawTime: '9:00 PM',
  },
  {
    game: 'Mass Cash (Midday)',
    drawDays: 'Daily',
    drawTime: '2:00 PM',
  },
  {
    game: 'Mass Cash (Evening)',
    drawDays: 'Daily',
    drawTime: '9:00 PM',
  },
  {
    game: 'Megabucks',
    drawDays: 'Mon, Wed, Sat',
    drawTime: '7:59 PM',
  },
  {
    game: 'Powerball',
    drawDays: 'Mon, Wed, Sat',
    drawTime: '10:59 PM',
  },
  {
    game: 'Mega Millions',
    drawDays: 'Tue, Fri',
    drawTime: '11:00 PM',
  },
];

function LotteryScheduleCard() {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-bold text-gray-900">This week&apos;s draw schedule</div>
          <div className="text-[11px] text-gray-400">Game, draw days, and time</div>
        </div>
      </div>
      <div className="mt-1 border-t border-gray-100 pt-2 space-y-1.5">
        {GAME_SCHEDULE.map((row) => (
          <div key={row.game} className="flex items-center justify-between text-[11px]">
            <div className="flex-1 pr-2 font-semibold text-gray-900 truncate">
              {row.game}
            </div>
            <div className="flex-[0.8] pr-2 text-gray-500 whitespace-nowrap">
              {row.drawDays}
            </div>
            <div className="flex-[0.7] pr-2 text-gray-500 whitespace-nowrap text-right">
              {row.drawTime}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KenoCard() {
  const [keno, setKeno] = useState<KenoResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadLatest() {
    setLoading(true);
    const { data } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('game_name', 'Keno')
      .order('draw_date', { ascending: false })
      .limit(1);
    setKeno((data && data[0]) as any || null);
    setLoading(false);
  }

  useEffect(() => {
    loadLatest();
  }, []);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await supabase.functions.invoke('fetch-community-data');
      await loadLatest();
    } finally {
      setRefreshing(false);
    }
  }

  if (loading && !keno) {
    return (
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}
      >
        <div className="h-4 w-24 rounded-full bg-gray-100" />
        <div className="h-4 w-16 rounded-full bg-gray-100" />
      </div>
    );
  }

  if (!keno) return null;

  const draw = new Date(keno.draw_date);

  return (
    <div
      className="mt-1 rounded-2xl p-4 space-y-3"
      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-bold text-gray-900">Keno · Latest draw</div>
          <div className="text-[11px] text-gray-400">
            {isNaN(draw.getTime())
              ? 'Statewide'
              : draw.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.97] transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(keno.numbers as number[]).slice(0, 20).map((n, i) => (
          <div
            key={`${keno.id}-${i}`}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              color: '#111827',
            }}
          >
            {n}
          </div>
        ))}
      </div>

      <a
        href={keno.official_url || 'https://www.masslottery.com/tools/past-results/keno'}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] font-medium text-gray-400 flex items-center justify-end gap-1"
      >
        View official Keno results
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

function MegabucksCard() {
  const [megabucks, setMegabucks] = useState<MegabucksResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadLatest() {
    setLoading(true);
    const { data } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('game_name', 'Megabucks')
      .order('draw_date', { ascending: false })
      .limit(1);

    setMegabucks((data && data[0]) as any || null);
    setLoading(false);
  }

  useEffect(() => {
    loadLatest();
  }, []);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await supabase.functions.invoke('fetch-lottery');
      await loadLatest();
    } finally {
      setRefreshing(false);
    }
  }

  if (loading && !megabucks) {
    return (
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}
      >
        <div className="h-4 w-24 rounded-full bg-gray-100" />
        <div className="h-4 w-16 rounded-full bg-gray-100" />
      </div>
    );
  }

  if (!megabucks) return null;

  const draw = new Date(megabucks.draw_date);

  const toNumberArray = (value: unknown): number[] => {
    if (Array.isArray(value)) {
      return value
        .map((n) => (typeof n === 'number' && !isNaN(n) ? n : Number(n)))
        .filter((n) => !isNaN(n));
    }
    if (typeof value === 'string') {
      return value
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number)
        .filter((n) => !isNaN(n));
    }
    return [];
  };

  const numbers = toNumberArray(megabucks.numbers);
  const specials = toNumberArray(megabucks.special_number);

  return (
    <div
      className="mt-1 rounded-2xl p-4 space-y-3"
      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-bold text-gray-900">Megabucks · Last draw</div>
          <div className="text-[11px] text-gray-400">
            {isNaN(draw.getTime())
              ? 'Massachusetts'
              : draw.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.97] transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {numbers.map((n, i) => (
          <div
            key={`${megabucks.id}-n-${i}`}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              color: '#111827',
            }}
          >
            {n}
          </div>
        ))}
        {specials.length > 0 && (
          <>
            <span className="w-1 shrink-0" aria-hidden="true" />
            {specials.map((n, i) => (
              <div
                key={`${megabucks.id}-s-${i}`}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold"
                style={{
                  backgroundColor: '#0ea5e9',
                  border: '1px solid #0ea5e9',
                  boxShadow: '0 1px 6px rgba(14,165,233,0.4)',
                  color: '#ffffff',
                }}
              >
                {n}
              </div>
            ))}
          </>
        )}
      </div>

      <a
        href={megabucks.official_url || 'https://www.masslottery.com/tools/past-results/megabucks'}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] font-medium text-gray-400 flex items-center justify-end gap-1"
      >
        View official Megabucks results
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

const LotteryTab = ({ onBackToHome }: { onBackToHome?: () => void }) => {
  return (
    <div className="space-y-4">
      <div className="text-center pt-2 pb-1">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground mb-1"
          >
            ← Back to Home
          </button>
        )}
        <h1 className="text-[22px] font-bold" style={{ color: '#111827' }}>Lottery</h1>
        <p className="text-[12px]" style={{ color: '#9ca3af' }}>Latest lottery results for Fall River</p>
      </div>
      <LotteryScheduleCard />
      <LotteryWidget showHistory />
      <KenoCard />
    </div>
  );
};

export default LotteryTab;
