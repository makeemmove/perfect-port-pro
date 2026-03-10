CREATE TABLE public.lottery_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name text NOT NULL,
  draw_date timestamptz NOT NULL,
  numbers jsonb NOT NULL,
  special_number jsonb,
  multiplier text,
  jackpot text,
  official_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(game_name, draw_date)
);

ALTER TABLE public.lottery_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lottery results"
  ON public.lottery_results
  FOR SELECT
  TO public
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.lottery_results;