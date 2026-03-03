import { ExternalLink, Newspaper } from 'lucide-react';
import type { NewsArticle } from '@/hooks/useNews';

interface NewsPreviewWidgetProps {
  articles: NewsArticle[];
  onNewsClick?: () => void;
}

const NewsPreviewWidget = ({ articles, onNewsClick }: NewsPreviewWidgetProps) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground
                      before:flex-1 before:h-px before:bg-border
                      after:flex-1 after:h-px after:bg-border">
        <Newspaper className="w-3 h-3" /> Latest News
      </div>
      <div className="flex flex-col gap-2">
        {articles.slice(0, 3).map((article) => (
          <div
            key={article.id}
            className="p-3 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
            onClick={() => onNewsClick?.()}
          >
            <div className="text-sm font-semibold text-foreground leading-snug mb-1">{article.title}</div>
            {article.summary && (
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1">{article.summary}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-semibold text-primary">{article.source_name}</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onNewsClick}
        className="w-full py-2.5 rounded-xl bg-foreground/5 text-foreground text-[11px] font-semibold tracking-wide uppercase border border-border hover:bg-foreground/10 transition-colors"
      >
        View All News →
      </button>
    </div>
  );
};

export default NewsPreviewWidget;
