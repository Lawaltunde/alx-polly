
import PollResults from "@/app/components/shared/PollResults";
import { getPoll } from "@/app/lib/supabase/queries";
import { notFound } from "next/navigation";

export default async function PollResultsPage({ params }: { params: { pollId: string } }) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  return <PollResults pollId={pollId} initialPoll={poll} />;
}