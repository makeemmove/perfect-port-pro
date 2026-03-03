import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  imageUrl?: string;
}

const CACHE_KEY = 'fr-news-cache';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-news');
      if (error) throw error;
      if (data?.articles) {
        setArticles(data.articles);
        setLastFetched(data.fetchedAt || new Date().toISOString());
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ articles: data.articles, fetchedAt: data.fetchedAt }));
        } catch { /* ignore */ }
      }
    } catch (e) {
      console.error('Failed to fetch news:', e);
      // Try loading from cache
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setArticles(parsed.articles || []);
          setLastFetched(parsed.fetchedAt || null);
        }
      } catch { /* ignore */ }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load cache first for instant display
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setArticles(parsed.articles || []);
        setLastFetched(parsed.fetchedAt || null);
      }
    } catch { /* ignore */ }

    fetchNews();
    const interval = setInterval(fetchNews, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNews]);

  return { articles, isLoading, lastFetched, refetch: fetchNews };
}
