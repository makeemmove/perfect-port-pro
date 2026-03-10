import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ExternalLink, ChevronDown } from 'lucide-react';

interface Obituary {
  id: string;
  full_name: string;
  age: number | null;
  date_of_passing: string | null;
  obituary_url: string;
  source: string;
  city: string;
  created_at: string;
}

interface ObituariesWidgetProps {
  compact?: boolean;
  onSeeAll?: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ObituaryRow({ obit }: { obit: Obituary }) {
  return (
    <a
      href={obit.obituary_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between px-4 py-3.5 transition-all duration-200 active:scale-[0.99] cursor-pointer group"
      style={{ borderBottom: '1px solid #f3f4f6' }}
    >
      <div className="min-w-0 flex-1">
        <h4 className="text-[14px] font-semibold truncate" style={{ color: '#111827' }}>
          {obit.full_name}
        </h4>
        <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
          {obit.age && `Age ${obit.age}`}
          {obit.age && obit.date_of_passing && ' · '}
          {obit.date_of_passing && formatDate(obit.date_of_passing)}
          {!obit.age && !obit.date_of_passing && obit.source}
        </p>
      </div>
      <ExternalLink
        className="w-3.5 h-3.5 flex-shrink-0 ml-3 opacity-0 group-hover:opacity-50 transition-opacity"
        style={{ color: '#9ca3af' }}
      />
    </a>
  );
}

const ObituariesWidget = ({ compact = false, onSeeAll }: ObituariesWidgetProps) => {
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('local_obituaries')
        .select('*')
        .eq('city', 'Fall River')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        setObituaries(data as Obituary[]);
      } else {
        try {
          await supabase.functions.invoke('fetch-obituaries');
          const { data: fresh } = await supabase
            .from('local_obituaries')
            .select('*')
            .eq('city', 'Fall River')
            .order('created_at', { ascending: false })
            .limit(10);
          if (fresh) setObituaries(fresh as Obituary[]);
        } catch (e) {
          console.error('Failed to fetch obituaries:', e);
        }
      }
      setIsLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('obituary-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'local_obituaries' }, () => {
        supabase.from('local_obituaries').select('*').eq('city', 'Fall River')
          .order('created_at', { ascending: false }).limit(10)
          .then(({ data }) => {
            if (data) setObituaries(data as Obituary[]);
          });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const displayObituaries = compact ? obituaries.slice(0, 3) : obituaries;

  return (
    <div className="glass-card p-6 py-[15px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
          <Heart className="w-4 h-4" style={{ color: '#6b7280' }} />
        </div>
        <span className="text-[9px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ backgroundColor: '#f3f4f610', color: '#6b7280' }}>
          In Memoriam · Fall River
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : obituaries.length === 0 ? (
        <div className="text-center py-8 text-[13px] text-muted-foreground">
          No recent obituaries found. This section updates every 2 hours.
        </div>
      ) : (
        <>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
              backgroundColor: '#ffffff',
            }}
          >
            {displayObituaries.map((obit) => (
              <ObituaryRow key={obit.id} obit={obit} />
            ))}
          </div>

          {compact && obituaries.length > 3 && onSeeAll && (
            <button
              onClick={onSeeAll}
              className="mt-3 w-full text-[12px] font-semibold flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all duration-200 hover:bg-muted/30"
              style={{ color: '#6b7280' }}
            >
              See All ({obituaries.length})
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}

      <div className="text-[10px] text-muted-foreground/50 mt-3 text-center">
        Updates every 2 hours · Fall River, MA only
      </div>
    </div>
  );
};

export default ObituariesWidget;
