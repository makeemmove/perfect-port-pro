import { useState } from 'react';
import { ExternalLink, RefreshCw, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
          ))}
        </div>
      )}

      {/* Article detail modal */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => { if (!open) setSelectedArticle(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg leading-snug pr-6">{selectedArticle?.title}</DialogTitle>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{getTimeAgo(selectedArticle.published_at)}</span>
              </div>
              {selectedArticle.content ? (
                <div className="prose prose-sm max-w-none dark:prose-invert text-foreground text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedArticle.content) }}
                />
              ) : selectedArticle.summary ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedArticle.summary}</p>
              ) : null}
              {selectedArticle.source_url && (
                <button
                  onClick={() => window.open(selectedArticle.source_url, '_blank', 'noopener,noreferrer')}
                  className="flex items-center gap-2 text-xs text-primary hover:underline"
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
      className="p-4 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
      onClick={onClick}
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
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
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
