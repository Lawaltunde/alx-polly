-- Allow poll owners to view their polls regardless of status/visibility
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'polls' AND policyname = 'Owners can view their polls'
  ) THEN
    EXECUTE 'DROP POLICY "Owners can view their polls" ON public.polls';
  END IF;
END $$;

CREATE POLICY "Owners can view their polls" ON public.polls
  FOR SELECT USING (created_by = auth.uid());
