import { useState } from 'react';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { NewsArticle } from '@/hooks/useNews';

interface NewsTabProps {
  articles: NewsArticle[];
  isLoading: boolean;
  lastFetched: string | null;
  onRefresh: () => void;
}

const NewsTab = ({ articles, isLoading, lastFetched, onRefresh }: NewsTabProps) => {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">News</h1>
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium">
            {lastFetched ? `Updated ${new Date(lastFetched).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Loading...'}
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-3 rounded-full glass-card text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all duration-300 ease-in-out disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
        </button>
      </div>

      {isLoading && articles.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-6">
              <Skeleton className="h-3 w-1/4 mb-3 rounded-full" />
              <Skeleton className="h-4 w-5/6 mb-2 rounded-full" />
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-muted-foreground text-center py-12 text-sm">No news articles available</div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Featured first article */}
          {articles.length > 0 && (
            <div
              className="group glass-card p-6 active:scale-[0.98] transition-all duration-300 ease-in-out cursor-pointer relative overflow-hidden"
              onClick={() => setSelectedArticle(articles[0])}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/60" />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary bg-primary/[0.06] px-2.5 py-1 rounded-full">Latest</span>
                <span className="text-[10px] text-muted-foreground">{getTimeAgo(articles[0].published_at)}</span>
              </div>
              <h3 className="text-base font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors duration-300">
                {articles[0].title}
              </h3>
              {articles[0].summary && (
                <p className="text-xs text-muted-foreground leading-relaxed">{articles[0].summary}</p>
              )}
              <div className="flex items-center gap-1 mt-4 text-[10px] font-semibold text-primary uppercase tracking-wide">
                Read more <ChevronRight className="w-3 h-3" strokeWidth={2} />
              </div>
            </div>
          )}

          {articles.slice(1).map((article) => (
            <NewsCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
          ))}
        </div>
      )}

      <Dialog open={!!selectedArticle} onOpenChange={(open) => { if (!open) setSelectedArticle(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-[20px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold leading-snug pr-6">{selectedArticle?.title}</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-1">
              {selectedArticle ? getTimeAgo(selectedArticle.published_at) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4 pt-2">
              {selectedArticle.content ? (
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {stripMarkdown(selectedArticle.content)}
                </div>
              ) : selectedArticle.summary ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{stripMarkdown(selectedArticle.summary)}</p>
              ) : null}
            </div>
          )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const NewsCard = ({ article, onClick }: { article: NewsArticle; onClick: () => void }) => {
  const timeAgo = getTimeAgo(article.published_at);

  return (
    <div
      className="group flex items-center gap-4 glass-card p-5 active:scale-[0.98] transition-all duration-300 ease-in-out cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-foreground leading-snug mb-1 group-hover:text-primary transition-colors duration-300">
          {article.title}
        </div>
        {article.summary && (
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1">{article.summary}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo}</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors duration-300" strokeWidth={2} />
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
