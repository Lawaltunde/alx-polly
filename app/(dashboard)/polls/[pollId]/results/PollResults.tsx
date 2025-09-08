"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { getPoll, getPollVotes } from "@/app/lib/supabase/queries";
import { PollWithDetails, Vote } from "@/app/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PollResultsProps = {
  initialPoll: PollWithDetails;
};

export default function PollResults({ initialPoll }: PollResultsProps) {
  const [poll, setPoll] = useState<PollWithDetails>(initialPoll);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchVotes = async () => {
      const pollVotes = await getPollVotes(poll.id);
      setVotes(pollVotes);
      setTotalVotes(pollVotes.length);
    };

    fetchVotes();

    const supabase = createClient();
    const channel = supabase
      .channel(`poll_${poll.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "votes", filter: `poll_id=eq.${poll.id}` },
        (payload) => {
          setVotes((currentVotes) => [...currentVotes, payload.new as Vote]);
          setTotalVotes((currentTotal) => currentTotal + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll.id]);

  const getOptionVotes = (optionId: string) => {
    return votes.filter((vote) => vote.option_id === optionId).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {poll.poll_options.map((option) => {
            const voteCount = getOptionVotes(option.id);
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
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
      </CardContent>
    </Card>
  );
}