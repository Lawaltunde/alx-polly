import { getPoll } from "@/app/lib/supabase/queries";
import { notFound } from "next/navigation";
import { deletePollAction } from "@/app/lib/actions";

import { Button } from "@/components/ui/button";
import EditPollForm from "@/app/components/shared/EditPollForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DeletePollDialog from "@/app/components/shared/DeletePollDialog";

export default async function PollSettingsPage({ params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12 md:min-h-[70vh] md:flex md:items-center">
        <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{poll.question} — Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">Edit Poll</h2>
              <p className="text-sm text-muted-foreground mb-4">Update your question, options, and toggles below.</p>
              <EditPollForm poll={poll} />
            </section>

            <Separator />

            <section>
              <h2 className="text-lg font-semibold mb-2">Danger zone</h2>
              <p className="text-sm text-muted-foreground mb-4">Deleting a poll is permanent and removes all votes and options.</p>
              <DeletePollDialog pollId={poll.id} />
            </section>
          </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}