import { getPoll } from "@/app/lib/data";
import { notFound } from "next/navigation";
import { deletePoll } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import EditPollForm from "@/app/components/shared/EditPollForm";

export default async function PollSettingsPage({ params }: { params: { pollId: string } }) {
  const poll = await getPoll(params.pollId);

  if (!poll) {
    notFound();
  }

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">{poll.question} - Settings</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold">Edit Poll</h2>
        <EditPollForm poll={poll} />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Delete Poll</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          This action is irreversible. Please be certain before deleting this poll.
        </p>
        <form action={deletePoll.bind(null, poll.id)}>
          <Button variant="destructive">Delete Poll</Button>
        </form>
      </div>
    </div>
  );
}