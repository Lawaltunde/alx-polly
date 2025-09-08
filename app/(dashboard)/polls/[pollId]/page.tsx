import { getPoll } from "@/app/lib/supabase/queries";
import { notFound } from "next/navigation";
import { handleVote } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ShareButton from "@/app/components/ShareButton";
import PollStatusButton from "@/app/components/shared/PollStatusButton";
import { Settings } from "lucide-react";

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
          <form action={handleVote.bind(null, poll.id, "dashboard")}>
            <div className="space-y-4">
              {poll.poll_options?.map((option) => (
                <button
                  key={option.id}
                  name="option"
                  value={option.id}
                  className="option-button w-full text-left p-4 border rounded-lg flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold">{option.text}</span>
                </button>
              ))}
            </div>
          </form>
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