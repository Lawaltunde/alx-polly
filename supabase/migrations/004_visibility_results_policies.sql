-- Add visibility controls to polls and align RLS with minimal behavior change

-- 1) Add columns with safe defaults to preserve current behavior
ALTER TABLE public.polls
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','unlisted','private')),
  ADD COLUMN IF NOT EXISTS results_visibility TEXT NOT NULL DEFAULT 'public' CHECK (results_visibility IN ('public','after_close','owner_only'));

-- 2) Update polls SELECT policy to respect visibility while keeping defaults public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'polls' AND policyname = 'Public polls are viewable by everyone'
  ) THEN
    EXECUTE 'DROP POLICY "Public polls are viewable by everyone" ON public.polls';
  END IF;
END $$;

CREATE POLICY "Visible open polls are viewable" ON public.polls
  FOR SELECT USING (
    status = 'open' AND visibility IN ('public','unlisted')
  );

-- 3) Tighten poll_options SELECT to follow poll visibility while preserving owner access
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'poll_options' AND policyname = 'Poll options are viewable by everyone'
  ) THEN
    EXECUTE 'DROP POLICY "Poll options are viewable by everyone" ON public.poll_options';
  END IF;
END $$;

CREATE POLICY "Options for visible polls are viewable" ON public.poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls p
      WHERE p.id = poll_id AND p.status = ''open'' AND p.visibility IN (''public'',''unlisted'')
    )
  );

CREATE POLICY "Owners can view their poll options" ON public.poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls p
      WHERE p.id = poll_id AND p.created_by = auth.uid()
    )
  );

-- Note: results_visibility is currently an application concern. You can later
-- gate results endpoints/UI based on results_visibility without further DB changes.
