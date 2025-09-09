"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { getPoll, getPollVotes } from "@/app/lib/supabase/queries";
import { PollWithDetails, Vote } from "@/app/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PollResultsProps = {
  pollId: string;
  initialPoll?: PollWithDetails;
  onGoBack?: () => void;
};

export default function PollResults({ pollId, initialPoll, onGoBack }: PollResultsProps) {
  const [poll, setPoll] = useState<PollWithDetails | null>(initialPoll || null);
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    const fetchAndSetData = async () => {
      const pollData = initialPoll ?? (await getPoll(pollId));

      if (pollData) {
        setPoll(pollData);
        const pollVotes = await getPollVotes(pollData.id);
        setVotes(pollVotes);
        console.log("Fetched votes:", pollVotes);
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
        (payload) => {
          setVotes((currentVotes) => [...currentVotes, payload.new as Vote]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll]);

  const totalVotes = votes.length;

  const getOptionVotes = (optionId: string) => {
    return votes.filter((vote) => vote.option_id === optionId).length;
  };

  if (!poll) {
    return <div>Loading poll results...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {poll.poll_options.map((option) => {
            const voteCount = getOptionVotes(option.id);
            const percentage =
              totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>{option.text}</span>
                  <span>{`${voteCount} vote(s)`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-right mt-4 text-sm text-gray-500">{`Total Votes: ${totalVotes}`}</p>
        <button
          onClick={onGoBack}
          className="w-full mt-4 py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Go Back to Voting
        </button>
      </CardContent>
    </Card>
  );
}