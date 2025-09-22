-- Add admin bypass to RLS policies (additive, preserves user checks)

-- Polls: allow admins to select/update/delete any; insert remains as created_by
DROP POLICY IF EXISTS "Public polls are viewable by everyone" ON public.polls;
CREATE POLICY "Public polls are viewable by everyone" ON public.polls
  FOR SELECT USING (status = 'open' OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view their own polls" ON public.polls;
CREATE POLICY "Users can view their own polls" ON public.polls
  FOR SELECT USING (auth.uid() = created_by OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own polls" ON public.polls;
CREATE POLICY "Users can update their own polls" ON public.polls
  FOR UPDATE USING (auth.uid() = created_by OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own polls" ON public.polls;
CREATE POLICY "Users can delete their own polls" ON public.polls
  FOR DELETE USING (auth.uid() = created_by OR public.is_admin(auth.uid()));

-- Poll options
DROP POLICY IF EXISTS "Poll options are viewable by everyone" ON public.poll_options;
CREATE POLICY "Poll options are viewable by everyone" ON public.poll_options
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create options for their own polls" ON public.poll_options;
CREATE POLICY "Users can create options for their own polls" ON public.poll_options
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid()) OR EXISTS (
      SELECT 1 FROM public.polls WHERE id = poll_id AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update options for their own polls" ON public.poll_options;
CREATE POLICY "Users can update options for their own polls" ON public.poll_options
  FOR UPDATE USING (
    public.is_admin(auth.uid()) OR EXISTS (
      SELECT 1 FROM public.polls WHERE id = poll_id AND created_by = auth.uid()
    )
  );

-- Votes
DROP POLICY IF EXISTS "Users can vote on open polls" ON public.votes;
CREATE POLICY "Users can vote on open polls" ON public.votes
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid()) OR EXISTS (
      SELECT 1 FROM public.polls WHERE id = poll_id AND status = 'open'
    )
  );

DROP POLICY IF EXISTS "Users can view votes on polls they created" ON public.votes;
CREATE POLICY "Users can view votes on polls they created" ON public.votes
  FOR SELECT USING (
    public.is_admin(auth.uid()) OR EXISTS (
      SELECT 1 FROM public.polls WHERE id = poll_id AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view their own votes" ON public.votes;
CREATE POLICY "Users can view their own votes" ON public.votes
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- QR codes remain public select & admin can insert for any poll
DROP POLICY IF EXISTS "QR codes are viewable by everyone" ON public.poll_qr_codes;
CREATE POLICY "QR codes are viewable by everyone" ON public.poll_qr_codes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create QR codes for their own polls" ON public.poll_qr_codes;
CREATE POLICY "Users can create QR codes for their own polls" ON public.poll_qr_codes
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid()) OR EXISTS (
      SELECT 1 FROM public.polls WHERE id = poll_id AND created_by = auth.uid()
    )
  );

-- Profiles: keep public read; users update self; admin may update any
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));
