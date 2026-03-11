-- User-submitted tributes (pending approval before going live)
CREATE TABLE public.tribute_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  birth_date date,
  passing_date date,
  picture_url text,
  article_bio text,
  submitter_name text,
  status text NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved')),
  city text NOT NULL DEFAULT 'Fall River',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tribute_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (submit a tribute)
CREATE POLICY "Anyone can submit a tribute"
  ON public.tribute_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Anyone can read approved tributes only (for display on Obituaries page)
CREATE POLICY "Anyone can read approved tributes"
  ON public.tribute_submissions
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Service role can update (approve tributes via Dashboard Table Editor or SQL)
-- To approve: set status = 'approved' for a row in Supabase Dashboard.
CREATE POLICY "Service role can update tribute_submissions"
  ON public.tribute_submissions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Storage bucket for tribute photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tribute-photos',
  'tribute-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to tribute-photos (for form submissions)
CREATE POLICY "Anyone can upload tribute photos"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'tribute-photos');

-- Allow public read for tribute-photos (approved tributes display images)
CREATE POLICY "Public read tribute photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'tribute-photos');
