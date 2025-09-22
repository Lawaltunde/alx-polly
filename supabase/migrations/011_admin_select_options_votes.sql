-- Ensure admins can view poll_options and votes for all polls
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'poll_options' AND policyname = 'Admins can view all poll options'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all poll options" ON public.poll_options
      FOR SELECT USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'votes' AND policyname = 'Admins can view all votes'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all votes" ON public.votes
      FOR SELECT USING (public.is_admin(auth.uid()))';
  END IF;
END $$;
