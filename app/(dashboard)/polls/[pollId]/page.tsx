import { getPoll } from "@/app/lib/supabase/queries";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ShareButton from "@/app/components/ShareButton";
import PollStatusButton from "@/app/components/shared/PollStatusButton";
import { Settings } from "lucide-react";
import PollVoteFormDashboard from "./poll-vote-form-dashboard";

export const revalidate = 0;

export default async function PollPage({ params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  const voteCounts = poll.poll_options?.map((option) => {
    const count = option.votes[0]?.count || 0;
    return { ...option, count };
  });

  const totalVotes = voteCounts?.reduce((acc, option) => acc + option.count, 0) || 0;

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
          <div className="space-y-4">
            {voteCounts?.map((option) => {
              const percentage = totalVotes > 0 ? (option.count / totalVotes) * 100 : 0;
              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{option.text}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {option.count} votes ({percentage.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}