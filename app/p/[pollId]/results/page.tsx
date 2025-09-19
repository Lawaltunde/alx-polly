
import { getPoll } from "@/app/lib/supabase/queries";
import { notFound } from "next/navigation";
import PollResults from "@/app/components/shared/PollResults";

export default async function PublicPollResultsPage({ params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <PollResults pollId={pollId} initialPoll={poll} />
    </div>
  );
}