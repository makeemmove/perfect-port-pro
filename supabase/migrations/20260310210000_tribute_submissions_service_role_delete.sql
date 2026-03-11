-- Allow service role to delete tribute_submissions (for admin dashboard / Edge Function)
CREATE POLICY "Service role can delete tribute_submissions"
  ON public.tribute_submissions
  FOR DELETE
  TO service_role
  USING (true);
