"use client";

import { getPolls } from "@/app/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { PollWithDetails } from "@/app/lib/types";

export default function PollsPage() {
  const [polls, setPolls] = useState<PollWithDetails[]>([]);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const pollsData = await getPolls();
        setPolls(pollsData);
      } catch (error) {
        console.error(error);
        setPolls([]);
      }
    };

    fetchPolls();
  }, []);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Polls</h1>
        {/* This link navigates the user to the page for creating a new poll. */}
        <Link href="/polls/new">
          <Button className="create-poll-button flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white">
            <PlusCircle className="w-5 h-5" />
            <span>Create Poll</span>
          </Button>
        </Link>
      </div>
      {polls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Map over the array of polls and render a card for each one. */}
          {polls.map((poll) => (
            <Link href={`/polls/${poll.id}`} key={poll.id}>
              <Card className="poll-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                    {poll.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {poll.poll_options?.map((o) => o.text).join(", ") || "No options"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    {poll.poll_options?.length || 0} options
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    by {poll.profiles?.username || 'Anonymous'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        // This section is displayed if there are no polls to show.
        // It provides a clear call to action for the user to create the first poll.
        <div className="flex flex-col items-center justify-center text-center py-20">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">No Polls Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            It looks like there are no polls available right now. Be the first to create one!
          </p>
          <Link href="/polls/new">
            <Button className="create-poll-button flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white">
              <PlusCircle className="w-5 h-5" />
              <span>Create a New Poll</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}