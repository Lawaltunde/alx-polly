
import { getPoll } from "@/app/lib/supabase/queries";
import { notFound } from "next/navigation";
import PollResults from "@/app/components/shared/PollResults";
import { getCurrentUser } from "@/app/lib/auth";

export default async function PublicPollResultsPage({ params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  // Enforce results_visibility on public page
  const user = await getCurrentUser();
  const isOwner = user?.id && poll.created_by === user.id;
  if (poll.results_visibility === 'owner_only' && !isOwner) {
    notFound();
  }
  if (poll.results_visibility === 'after_close' && poll.status !== 'closed' && !isOwner) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <PollResults pollId={pollId} initialPoll={poll} />
    </div>
  );
}