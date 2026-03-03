import { ChevronRight, Newspaper } from 'lucide-react';
import type { NewsArticle } from '@/hooks/useNews';

interface NewsPreviewWidgetProps {
  articles: NewsArticle[];
  onNewsClick?: () => void;
}

const NewsPreviewWidget = ({ articles, onNewsClick }: NewsPreviewWidgetProps) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground
                      before:flex-1 before:h-px before:bg-border/60
                      after:flex-1 after:h-px after:bg-border/60">
        <Newspaper className="w-3.5 h-3.5" strokeWidth={2} /> Latest News
      </div>
      <div className="flex flex-col gap-3">
        {articles.slice(0, 3).map((article) => (
          <div
            key={article.id}
            className="group flex items-center gap-3 glass-card p-4 active:scale-[0.98] transition-all duration-300 ease-in-out cursor-pointer"
            onClick={() => onNewsClick?.()}
          >
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-300">
                {article.title}
              </div>
              {article.summary && (
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-1">{article.summary}</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary flex-shrink-0 transition-colors duration-300" strokeWidth={2} />
          </div>
        ))}
      </div>
      <button
        onClick={onNewsClick}
        className="w-full py-3 rounded-2xl bg-muted/60 text-foreground text-[11px] font-semibold tracking-wide uppercase active:scale-[0.98] transition-all duration-300 ease-in-out hover:bg-muted"
      >
        View All News →
      </button>
    </div>
  );
};

export default NewsPreviewWidget;
