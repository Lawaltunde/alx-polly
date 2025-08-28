import { getPoll } from "@/app/lib/data";
import { notFound } from "next/navigation";
import { handleVote } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";

export default async function PublicPollPage({ 
    params, 
    searchParams 
}: { 
    params: { pollId: string },
    searchParams: { [key: string]: string | string[] | undefined }
}) {
  const poll = await getPoll(params.pollId);

  if (!poll) {
    notFound();
  }

  if (searchParams.voted === 'true') {
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
            {poll.options.map((option) => (
              <button
                key={option.text}
                name="option"
                value={option.text}
                className="w-full text-left p-4 border rounded-lg flex justify-between items-center hover:bg-gray-100"
              >
                <span>{option.text}</span>
                <span>{option.votes} votes</span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}