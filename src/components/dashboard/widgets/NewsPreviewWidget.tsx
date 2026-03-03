import { ChevronRight, Newspaper } from 'lucide-react';
import type { NewsArticle } from '@/hooks/useNews';

interface NewsPreviewWidgetProps {
  articles: NewsArticle[];
  onNewsClick?: () => void;
}

const NewsPreviewWidget = ({ articles, onNewsClick }: NewsPreviewWidgetProps) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground
                      before:flex-1 before:h-px before:bg-border
                      after:flex-1 after:h-px after:bg-border">
        <Newspaper className="w-3 h-3" /> Latest News
      </div>
      <div className="flex flex-col gap-1.5">
        {articles.slice(0, 3).map((article, i) => (
          <div
            key={article.id}
            className="group flex items-center gap-3 p-4 rounded-[24px] bg-card shadow-card active:scale-95 transition-transform duration-150 cursor-pointer"
            onClick={() => onNewsClick?.()}
          >
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                {article.title}
              </div>
              {article.summary && (
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-1">{article.summary}</p>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary flex-shrink-0 transition-colors" />
          </div>
        ))}
      </div>
      <button
        onClick={onNewsClick}
        className="w-full py-2.5 rounded-full bg-foreground/[0.03] text-foreground text-[11px] font-semibold tracking-wide uppercase shadow-card active:scale-95 transition-transform duration-150"
      >
        View All News →
      </button>
    </div>
  );
};

export default NewsPreviewWidget;
