-- Create a simple view to aggregate votes per option for a poll
-- Safe to run multiple times with IF NOT EXISTS guards

-- 1) Create view
CREATE OR REPLACE VIEW public.poll_option_results AS
SELECT
  po.id,
  po.poll_id,
  po.text,
  COUNT(v.id)::int AS vote_count
FROM public.poll_options po
LEFT JOIN public.votes v ON v.option_id = po.id
GROUP BY po.id, po.poll_id, po.text;

-- 2) Ensure SELECT on votes aligns with visibility (optional, read-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'votes' AND policyname = 'View votes for visible polls'
  ) THEN
    EXECUTE 'CREATE POLICY "View votes for visible polls" ON public.votes
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.polls p
          JOIN public.poll_options o ON o.poll_id = p.id
          WHERE o.id = option_id AND (
            p.created_by = auth.uid() OR (p.status = ''open'' AND p.visibility IN (''public'',''unlisted''))
          )
        )
      )';
  END IF;
END $$;
