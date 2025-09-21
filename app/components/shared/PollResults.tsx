"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/app/lib/supabase/useSupabaseClient";
import { getPoll, getPollOptionResults } from "@/app/lib/supabase/queries";
import { PollWithDetails, Vote } from "@/app/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PollChart from "./PollChart";
import { toast } from "sonner";

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

  // Show a friendly notice if user already voted
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('already') === '1') {
      toast.info('You already voted on this poll. Duplicate votes are not allowed.');
      // Remove the flag from URL without reload
      params.delete('already');
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const { supabase, ready } = useSupabaseClient();

  useEffect(() => {
    if (!poll || !ready || !supabase) return;

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
          const updatedPoll = await getPoll(poll.id);
          setPoll(updatedPoll);
          if (process.env.NODE_ENV === "development") {
            console.log("Realtime poll fetched:", updatedPoll);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  }, [poll, ready, supabase]);

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