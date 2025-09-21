
import PollResults from "@/app/components/shared/PollResults";
import { getPoll } from "@/app/lib/supabase/server-queries";
import { notFound } from "next/navigation";
import { requireAuth } from "@/app/lib/auth";

export default async function PollResultsPage({ params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  // Owner can always view; enforce 'after_close' for non-owners (but this is dashboard, so ensure owner)
  const user = await requireAuth();
  const isOwner = poll.created_by === user.id;
  if (!isOwner) {
    if (poll.results_visibility === 'owner_only') notFound();
    if (poll.results_visibility === 'after_close' && poll.status !== 'closed') notFound();
  }
  return <PollResults pollId={pollId} initialPoll={poll} />;
}