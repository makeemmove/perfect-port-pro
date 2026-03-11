import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  title: string;
  source_name: string;
  source_url: string;
  content: string | null;
  summary: string | null;
  original_title: string | null;
  image_url: string | null;
  published_at: string;
  status: string;
  created_at: string;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/** Normalize for comparison: lowercase, single spaces, trimmed */
function normalizeTitle(title: string): string {
  return (title || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Dedupe by "story": same first 5 words = same story (catches "Mayor Coogan... for Future"
 * vs "...for Fall River" and other minor rewrites). Never show duplicate articles.
 */
function dedupeArticlesByTitle(articles: NewsArticle[]): NewsArticle[] {
  const seenKeys = new Set<string>();
  return articles.filter((a) => {
    const norm = normalizeTitle(a.title);
    const words = norm.split(/\s+/).filter(Boolean);
    const keyFirstWords = words.slice(0, 5).join(' ');
    if (seenKeys.has(keyFirstWords)) return false;
    seenKeys.add(keyFirstWords);
    return true;
  });
}

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchFromDB = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      if (data) {
        const list = data as NewsArticle[];
        setArticles(dedupeArticlesByTitle(list));
        setLastFetched(new Date().toISOString());
      }
    } catch (e) {
      console.error('Failed to fetch articles from DB:', e);
      try {
        const { data, error } = await supabase.functions.invoke('fetch-news');
        if (!error && data?.articles) {
          setArticles(dedupeArticlesByTitle(data.articles));
          setLastFetched(data.fetchedAt || new Date().toISOString());
        }
      } catch { /* ignore */ }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rewriteAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: null,
        headers: {},
      });
      // Use query param approach via direct fetch
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-news?rewrite=true`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      const result = await res.json();
      if (result?.articles) {
        setArticles(dedupeArticlesByTitle(result.articles));
        setLastFetched(result.fetchedAt || new Date().toISOString());
      }
    } catch (e) {
      console.error('Failed to rewrite articles:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFromDB();
    const interval = setInterval(fetchFromDB, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchFromDB]);

  return { articles, isLoading, lastFetched, refetch: fetchFromDB, rewriteAll };
}
