
-- Enable pg_cron and pg_net extensions for scheduled cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Allow mix_sessions to be updated by service role (for cleanup/status)
CREATE POLICY "Service role can update mix sessions"
ON public.mix_sessions
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Allow rate_limits to be deleted by service role (for cleanup)
CREATE POLICY "Service role can delete rate limits"
ON public.rate_limits
FOR DELETE
TO service_role
USING (true);
