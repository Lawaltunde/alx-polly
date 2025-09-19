import { getPoll } from "@/app/lib/supabase/queries";
import { notFound } from "next/navigation";
import PollVoteForm from "./poll-vote-form";
import Footer from "@/app/components/shared/Footer";

export default async function PublicPollPage({ 
  params, 
}: { 
  params: Promise<{ pollId: string }>; 
}) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-grow flex items-center justify-center p-4">
        <PollVoteForm poll={poll} />
      </main>
      <Footer />
    </div>
  );
}