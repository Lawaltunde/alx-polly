-- Ensure admins can view all polls regardless of status/visibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'polls' AND policyname = 'Admins can view all polls'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all polls" ON public.polls
      FOR SELECT USING (public.is_admin(auth.uid()))';
  END IF;
END $$;
