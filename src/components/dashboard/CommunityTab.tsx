import LotteryWidget from './widgets/LotteryWidget';
import ObituariesWidget from './widgets/ObituariesWidget';
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

const CommunityTab = () => {
  return (
    <div className="space-y-4">
      <div className="text-center pt-2 pb-1">
        <h1 className="text-[22px] font-bold" style={{ color: '#111827' }}>Community</h1>
        <p className="text-[12px]" style={{ color: '#9ca3af' }}>Lottery results & local memorials</p>
      </div>
      <LotteryWidget />
      <KenoCard />
      <ObituariesWidget />
    </div>
  );
};

export default CommunityTab;
