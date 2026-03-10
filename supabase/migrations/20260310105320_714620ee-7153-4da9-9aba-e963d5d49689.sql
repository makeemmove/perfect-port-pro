CREATE TABLE public.local_obituaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  age integer,
  date_of_passing date,
  obituary_url text NOT NULL UNIQUE,
  source text DEFAULT 'Legacy.com',
  city text DEFAULT 'Fall River',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.local_obituaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read obituaries"
  ON public.local_obituaries
  FOR SELECT
  TO public
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.local_obituaries;