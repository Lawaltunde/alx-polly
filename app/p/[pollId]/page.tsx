import { getPoll } from "@/app/lib/supabase/queries";
import PollVoteForm from "./poll-vote-form";
import Footer from "@/app/components/shared/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PublicPollPage({ 
  params, 
}: { 
  params: Promise<{ pollId: string }>; 
}) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  // If the poll is closed (or not visible due to RLS when closed), show a friendly message
  if (!poll || poll.status === 'closed') {
    return (
  <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="max-w-xl w-full">
            <CardHeader>
              <CardTitle>This poll isn’t accepting votes</CardTitle>
            </CardHeader>
            <CardContent>
      <p className="text-muted-foreground mb-6">
                The poll you’re trying to view is closed or not available for public voting at this time.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={`/p/${pollId}/results`}>
                  <Button variant="outline" className="w-full sm:w-auto">View Results</Button>
                </a>
                <a href="/polls">
                  <Button className="w-full sm:w-auto">Go to Dashboard</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
  <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex items-center justify-center p-4">
        <PollVoteForm poll={poll} />
      </main>
      <Footer />
    </div>
  );
}