-- Update votes insert policies to respect poll.require_auth and enforce one vote per user at DB level

-- Drop broad policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'votes'
      AND policyname = 'Users can vote on open polls'
  ) THEN
    EXECUTE 'DROP POLICY "Users can vote on open polls" ON public.votes';
  END IF;
END $$;

-- Allow anyone to vote on open polls that do NOT require auth
CREATE POLICY IF NOT EXISTS "Anyone can vote on non-auth open polls" ON public.votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.polls
      WHERE id = poll_id AND status = 'open' AND require_auth = false
    )
  );

-- Allow only authenticated users to vote on open polls that DO require auth
CREATE POLICY IF NOT EXISTS "Authenticated can vote on auth-required open polls" ON public.votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.polls
      WHERE id = poll_id AND status = 'open' AND require_auth = true
    )
    AND auth.uid() IS NOT NULL
  );

-- Enforce one vote per user for authenticated users at DB level (anonymous excluded)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_vote_per_user
  ON public.votes (poll_id, user_id)
  WHERE user_id IS NOT NULL;
