
-- Create articles table for AI news desk
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text UNIQUE NOT NULL,
  source_name text NOT NULL,
  title text NOT NULL,
  content text,
  summary text,
  original_title text,
  image_url text,
  status text NOT NULL DEFAULT 'published',
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published articles
CREATE POLICY "Anyone can read articles"
ON public.articles
FOR SELECT
USING (true);

-- Enable pg_cron and pg_net for scheduled fetching
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Index for performance
CREATE INDEX idx_articles_published_at ON public.articles (published_at DESC);
CREATE INDEX idx_articles_source_url ON public.articles (source_url);
