-- Enforce immediate single-vote after toggling it on
-- Prevents a user/device from getting one extra vote when polls.single_vote becomes true

-- 1) Create a trigger function that rejects a second vote when single_vote = true
CREATE OR REPLACE FUNCTION public.votes_prevent_second_vote_when_single()
RETURNS TRIGGER AS $$
DECLARE
  v_single BOOLEAN;
  v_require_auth BOOLEAN;
BEGIN
  -- Read current poll flags
  SELECT p.single_vote, p.require_auth
    INTO v_single, v_require_auth
  FROM public.polls p
  WHERE p.id = NEW.poll_id;

  -- If not single-vote, allow
  IF COALESCE(v_single, false) = false THEN
    RETURN NEW;
  END IF;

  -- If authenticated vote (user_id present), block if any prior vote by same user OR same device exists
  IF NEW.user_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.votes v
      WHERE v.poll_id = NEW.poll_id
        AND (
          v.user_id = NEW.user_id OR (
            NEW.ip_address IS NOT NULL AND NEW.user_agent IS NOT NULL AND
            v.ip_address = NEW.ip_address AND v.user_agent = NEW.user_agent
          )
        )
    ) THEN
      RAISE EXCEPTION 'single-vote enforced: duplicate vote' USING ERRCODE = '23505';
    END IF;
    RETURN NEW;
  END IF;

  -- Anonymous vote path (no user_id): block second vote from same device when single-vote
  IF NEW.user_id IS NULL THEN
    IF NEW.ip_address IS NOT NULL AND NEW.user_agent IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.votes v
      WHERE v.poll_id = NEW.poll_id
        AND v.ip_address = NEW.ip_address
        AND v.user_agent = NEW.user_agent
    ) THEN
      RAISE EXCEPTION 'single-vote enforced: duplicate vote (anon device)' USING ERRCODE = '23505';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) Ensure trigger exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'votes_before_insert_prevent_second') THEN
    DROP TRIGGER votes_before_insert_prevent_second ON public.votes;
  END IF;
  CREATE TRIGGER votes_before_insert_prevent_second
  BEFORE INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.votes_prevent_second_vote_when_single();
END $$;

-- Note:
-- We keep existing conditional unique indexes for performance and steady-state enforcement.
-- This trigger specifically closes the gap where prior votes were inserted before the single-vote flag was enabled,
-- ensuring no extra vote is permitted post-toggle.
