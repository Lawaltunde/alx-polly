import { getPoll } from "@/app/lib/supabase/server-queries";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ShareButton from "@/app/components/ShareButton";
import QRCodeButton from "@/app/components/QRCodeButton";
import PollStatusButton from "@/app/components/shared/PollStatusButton";
import { Settings } from "lucide-react";
import PollVoteFormDashboard from "./poll-vote-form-dashboard";
import PollResults from "@/app/components/shared/PollResults";

export const revalidate = 0;

export default async function PollPage({ params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{poll.question}</h1>
        <div className="flex space-x-2">
          <Link href={`/polls/${poll.id}/settings`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Button>
          </Link>
          <ShareButton pollId={poll.id} />
          <QRCodeButton pollId={poll.id} />
          <PollStatusButton pollId={poll.id} status={poll.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Options</h2>
          <PollVoteFormDashboard poll={poll} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <PollResults pollId={poll.id} initialPoll={poll} />
        </div>
      </div>
    </div>
  );
}