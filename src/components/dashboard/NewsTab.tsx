import { useState } from 'react';
import { ExternalLink, RefreshCw, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">News</h1>
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium">
            {lastFetched ? `Updated ${new Date(lastFetched).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Loading...'}
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2.5 rounded-full bg-card shadow-card text-muted-foreground hover:text-foreground active:scale-95 transition-transform duration-150 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && articles.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-5 rounded-[24px] bg-card animate-pulse shadow-card">
              <div className="h-3 bg-muted rounded-full w-1/4 mb-3" />
              <div className="h-4 bg-muted rounded w-5/6 mb-2" />
              <div className="h-3 bg-muted rounded w-full" />
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
              className="group p-6 rounded-[24px] bg-card shadow-card active:scale-95 transition-transform duration-150 cursor-pointer relative overflow-hidden"
              onClick={() => setSelectedArticle(articles[0])}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/60" />
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary bg-primary/8 px-2 py-0.5 rounded-full">Latest</span>
                <span className="text-[10px] text-muted-foreground">{getTimeAgo(articles[0].published_at)}</span>
              </div>
              <h3 className="text-base font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                {articles[0].title}
              </h3>
              {articles[0].summary && (
                <p className="text-xs text-muted-foreground leading-relaxed">{articles[0].summary}</p>
              )}
              <div className="flex items-center gap-1 mt-3 text-[10px] font-semibold text-primary uppercase tracking-wide">
                Read more <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          )}

          {/* Remaining articles in compact list */}
          {articles.slice(1).map((article) => (
            <NewsCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
          ))}
        </div>
      )}

      {/* Article detail modal */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => { if (!open) setSelectedArticle(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold leading-snug pr-6">{selectedArticle?.title}</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground mt-1">
              {selectedArticle ? getTimeAgo(selectedArticle.published_at) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4 pt-2">
              {selectedArticle.content ? (
                <div className="prose prose-sm max-w-none text-foreground text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedArticle.content) }}
                />
              ) : selectedArticle.summary ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedArticle.summary}</p>
              ) : null}
              {selectedArticle.source_url && (
                <button
                  onClick={() => window.open(selectedArticle.source_url, '_blank', 'noopener,noreferrer')}
                  className="flex items-center gap-2 text-xs font-medium text-primary hover:underline transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Original Source
                </button>
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
      className="group flex items-center gap-4 p-5 rounded-[24px] bg-card shadow-card active:scale-95 transition-transform duration-150 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-foreground leading-snug mb-1 group-hover:text-primary transition-colors">
          {article.title}
        </div>
        {article.summary && (
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1">{article.summary}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo}</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
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

function markdownToHtml(md: string): string {
  return md
    .replace(/### (.*?)$/gm, '<h3 class="text-base font-bold mt-4 mb-1">$1</h3>')
    .replace(/## (.*?)$/gm, '<h2 class="text-lg font-bold mt-5 mb-2">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p class="mb-3">')
    .replace(/$/, '</p>');
}

export default NewsTab;
