
import { getPoll } from "@/app/lib/supabase/queries";
import { notFound } from "next/navigation";
import PollResults from "@/app/components/shared/PollResults";

export default async function PublicPollResultsPage({
  params,
}: {
  params: { pollId: string };
}) {
  const poll = await getPoll(params.pollId);

  if (!poll) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <PollResults initialPoll={poll} />
    </div>
  );
}