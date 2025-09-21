-- Expand RLS to support viewing closed poll results and polls a user participated in

-- 1) Polls: allow results-visible polls to be viewable (even when closed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'polls' AND policyname = 'Results-visible polls are viewable'
  ) THEN
    EXECUTE 'CREATE POLICY "Results-visible polls are viewable" ON public.polls
      FOR SELECT USING (
        (results_visibility = ''public'') OR
        (results_visibility = ''after_close'' AND status = ''closed'')
      )';
  END IF;
END $$;

-- 2) Polls: allow voters to view polls they voted on
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'polls' AND policyname = 'Voters can view polls they voted on'
  ) THEN
    EXECUTE 'CREATE POLICY "Voters can view polls they voted on" ON public.polls
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.votes v WHERE v.poll_id = id AND v.user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- 3) poll_options: allow viewing options for results-visible polls
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'poll_options' AND policyname = 'Options for results-visible polls are viewable'
  ) THEN
    EXECUTE 'CREATE POLICY "Options for results-visible polls are viewable" ON public.poll_options
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.polls p
          WHERE p.id = poll_id AND (
            p.results_visibility = ''public'' OR (p.results_visibility = ''after_close'' AND p.status = ''closed'')
          )
        )
      )';
  END IF;
END $$;

-- 4) poll_options: allow viewing options for polls the user voted on
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'poll_options' AND policyname = 'Options for polls user voted on'
  ) THEN
    EXECUTE 'CREATE POLICY "Options for polls user voted on" ON public.poll_options
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.votes v
          WHERE v.poll_id = poll_id AND v.user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- 5) votes: extend SELECT to cover results-visible polls (for results pages)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'votes' AND policyname = 'View votes for results-visible polls'
  ) THEN
    EXECUTE 'CREATE POLICY "View votes for results-visible polls" ON public.votes
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.polls p
          JOIN public.poll_options o ON o.poll_id = p.id
          WHERE o.id = option_id AND (
            p.created_by = auth.uid() OR
            p.results_visibility = ''public'' OR
            (p.results_visibility = ''after_close'' AND p.status = ''closed'')
          )
        )
      )';
  END IF;
END $$;
