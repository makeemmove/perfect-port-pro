-- Add picture_url for obituary photos (og:image from source pages)
ALTER TABLE public.local_obituaries
  ADD COLUMN IF NOT EXISTS picture_url text;
