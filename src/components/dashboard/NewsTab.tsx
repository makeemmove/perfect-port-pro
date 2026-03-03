import { useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import type { NewsArticle } from '@/hooks/useNews';

interface NewsTabProps {
  articles: NewsArticle[];
  isLoading: boolean;
  lastFetched: string | null;
  onRefresh: () => void;
}

const sourceColors: Record<string, string> = {
  'Fall River Reporter': 'bg-primary/10 text-primary border-primary/20',
  'Herald News': 'bg-amber-50 text-amber-600 border-amber-200',
  'Fall River Police Department': 'bg-blue-50 text-blue-600 border-blue-200',
};

const NewsTab = ({ articles, isLoading, lastFetched, onRefresh }: NewsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">News</h1>
          <div className="text-xs text-muted-foreground">
            Fall River · {lastFetched ? `Updated ${new Date(lastFetched).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Loading...'}
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg bg-muted/50 border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && articles.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl bg-card border border-border animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-1" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-muted-foreground text-center py-8 text-sm">No news articles available</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {articles.map((article, i) => (
            <NewsCard key={i} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};

const NewsCard = ({ article }: { article: NewsArticle }) => {
  const timeAgo = getTimeAgo(article.publishedAt);
  const colorClass = Object.entries(sourceColors).find(([key]) =>
    article.source.toLowerCase().includes(key.toLowerCase())
  )?.[1] || 'bg-muted text-muted-foreground border-border';

  return (
    <div
      className="p-4 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
      onClick={() => article.url && window.open(article.url, '_blank', 'noopener,noreferrer')}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground leading-snug mb-1.5">
            {article.title}
          </div>
          {article.summary && (
            <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
              {article.summary}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-semibold tracking-wide uppercase py-[3px] px-2.5 rounded-full border ${colorClass}`}>
              {article.source}
            </span>
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
            {article.url && (
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default NewsTab;
