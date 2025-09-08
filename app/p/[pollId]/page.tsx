import { getPoll } from "@/app/lib/supabase/queries";
import { notFound } from "next/navigation";
import PollVoteForm from "./poll-vote-form";

export default async function PublicPollPage({ params }: {
  params: Promise<{ pollId: string }>
}) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <PollVoteForm poll={poll} />
    </div>
  );
}