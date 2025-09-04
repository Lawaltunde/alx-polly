import { getPollByShortCode } from "@/app/lib/qr-code";
import { notFound } from "next/navigation";
import { handleVote } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";

export default async function PublicPollPage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ pollId: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { pollId } = await params;
  const searchParamsData = await searchParams;
  const poll = await getPollByShortCode(pollId);

  if (!poll) {
    notFound();
  }

  if (searchParamsData.voted === 'true') {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-full max-w-2xl p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Thank you for voting!</h1>
            </div>
        </div>
    )
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-2xl p-4">
        <h1 className="text-2xl font-bold text-center mb-4">{poll.question}</h1>
        <form action={handleVote.bind(null, poll.id, "public")} className="w-full">
          <div className="grid gap-4">
            {poll.poll_options?.map((option: any) => (
              <button
                key={option.id}
                name="option"
                value={option.id}
                className="w-full text-left p-4 border rounded-lg flex justify-between items-center hover:bg-gray-100"
              >
                <span>{option.text}</span>
                <span>0 votes</span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}