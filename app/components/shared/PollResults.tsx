"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { getPoll, getPollOptionResults } from "@/app/lib/supabase/queries";
import { PollWithDetails, Vote } from "@/app/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PollChart from "./PollChart";

type PollResultsProps = {
  pollId: string;
  initialPoll?: PollWithDetails;
  onGoBack?: () => void;
};

export default function PollResults({ pollId, initialPoll, onGoBack }: PollResultsProps) {
  const [poll, setPoll] = useState<PollWithDetails | null>(initialPoll || null);
  const [optionResults, setOptionResults] = useState<Array<{ id: string; text: string; vote_count: number }>>([]);

  useEffect(() => {
    const fetchAndSetData = async () => {
      // Always fetch poll if missing or incomplete
      if (!initialPoll) {
        const pollData = await getPoll(pollId);
        setPoll(pollData);
      }
      // Fetch poll option results from backend view
      const results = await getPollOptionResults(pollId);
      setOptionResults(results);
      if (process.env.NODE_ENV === "development") {
        console.log("Poll option results:", results);
      }
    };
    fetchAndSetData();
  }, [pollId, initialPoll]);

  useEffect(() => {
    if (!poll) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`poll_${poll.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${poll.id}`,
        },
        async () => {
          // Re-fetch poll to update option vote counts for chart
          const updatedPoll = await getPoll(poll.id);
          setPoll(updatedPoll);
          if (process.env.NODE_ENV === "development") {
            console.log("Realtime poll fetched:", updatedPoll);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll]);

  // Aggregate vote counts per option in the frontend
  let totalVotes = 0;
  if (optionResults && optionResults.length > 0) {
    totalVotes = optionResults.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);
  }

  if (!poll) {
    return <div>Loading poll results...</div>;
  }

  // Data validation and error surfacing
  if (!poll.poll_options || poll.poll_options.length === 0) {
    return <div className="text-red-500">Error: No poll options found for this poll.</div>;
  }
  // No votes logic needed; results come from backend aggregation

  const chartOptions = optionResults.map(option => ({
    id: option.id,
    text: option.text,
    votes: option.vote_count ?? 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <PollChart options={chartOptions} totalVotes={totalVotes} />
        <p className="text-right mt-4 text-sm text-gray-500">{`Total Votes: ${totalVotes}`}</p>
        <button
          onClick={onGoBack ?? (() => window.location.href = '/polls')}
          className="w-full mt-4 py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Go Back to Polls
        </button>
      </CardContent>
    </Card>
  );
}