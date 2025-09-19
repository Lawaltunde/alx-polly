-- Anonymous single-vote hardening: one vote per device (IP + User-Agent)
-- Applies only when poll.single_vote = true AND poll.require_auth = false
-- This mitigates repeated anonymous votes via the shared link without forcing login.

-- 1) Add a flag column to votes that mirrors poll state for anonymous enforcement
ALTER TABLE public.votes
  ADD COLUMN IF NOT EXISTS enforce_single_vote_anon BOOLEAN;

-- 2) Create or replace a trigger function to set enforcement flags from the parent poll
CREATE OR REPLACE FUNCTION public.votes_set_enforce_flags()
RETURNS TRIGGER AS $$
BEGIN
  -- Carry over single-vote flag
  SELECT p.single_vote INTO NEW.enforce_single_vote
  FROM public.polls p WHERE p.id = NEW.poll_id;

  -- Anonymous enforcement: only when poll is single-vote AND does not require auth
  SELECT (p.single_vote = true AND p.require_auth = false) INTO NEW.enforce_single_vote_anon
  FROM public.polls p WHERE p.id = NEW.poll_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Ensure trigger exists to set flags before insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'votes_before_insert_set_enforce_flags'
  ) THEN
    CREATE TRIGGER votes_before_insert_set_enforce_flags
    BEFORE INSERT ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION public.votes_set_enforce_flags();
  ELSE
    -- Rebind existing trigger to updated function if needed
    DROP TRIGGER votes_before_insert_set_enforce_flags ON public.votes;
    CREATE TRIGGER votes_before_insert_set_enforce_flags
    BEFORE INSERT ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION public.votes_set_enforce_flags();
  END IF;
END $$;

-- 4) Create conditional unique index for anonymous voters per device
-- Uses combination of (poll_id, ip_address, user_agent) to reduce false positives behind NAT
CREATE UNIQUE INDEX IF NOT EXISTS uniq_vote_per_device_when_anon_single
  ON public.votes (poll_id, ip_address, user_agent)
  WHERE ip_address IS NOT NULL
    AND user_agent IS NOT NULL
    AND enforce_single_vote_anon = true;

-- Note: This is a pragmatic deterrent, not a perfect guarantee (IPs can be shared/rotated).
-- If you require strict one-person-one-vote, enable require_auth + single_vote instead.
