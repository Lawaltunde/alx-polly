-- Enforce single vote per authenticated user ONLY when poll.single_vote = true

-- 1) Add a denormalized flag on votes
ALTER TABLE public.votes
  ADD COLUMN IF NOT EXISTS enforce_single_vote BOOLEAN;

-- 2) Trigger to set the flag from the poll at insert time
CREATE OR REPLACE FUNCTION public.set_vote_enforce_flag()
RETURNS TRIGGER AS $$
BEGIN
  SELECT p.single_vote INTO NEW.enforce_single_vote
  FROM public.polls p
  WHERE p.id = NEW.poll_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_vote_enforce_flag ON public.votes;
CREATE TRIGGER trg_set_vote_enforce_flag
BEFORE INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.set_vote_enforce_flag();

-- 3) Replace the previous unconditional unique index with a conditional one
DROP INDEX IF EXISTS uniq_vote_per_user;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_vote_per_user_when_single
  ON public.votes (poll_id, user_id)
  WHERE user_id IS NOT NULL AND enforce_single_vote = true;
