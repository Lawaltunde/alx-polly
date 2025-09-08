'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { PollWithDetails } from '@/app/lib/types';
import { useRouter } from 'next/navigation';

interface PollVoteFormProps {
  poll: PollWithDetails;
}

export default function PollVoteForm({ poll: initialPoll }: PollVoteFormProps) {
  const [poll, setPoll] = useState(initialPoll);
  const [totalVotes, setTotalVotes] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const calculateTotalVotes = (pollData: any) => {
    return pollData.poll_options?.reduce((sum: number, option: any) => {
      const count = Array.isArray(option.votes) && option.votes.length > 0 ? option.votes[0].count : 0;
      return sum + count;
    }, 0) || 0;
  };

  useEffect(() => {
    setPoll(initialPoll);
    setTotalVotes(calculateTotalVotes(initialPoll));

    const channel = supabase
      .channel(`poll-votes-${initialPoll.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${initialPoll.id}`,
        },
        async () => {
          const { data: updatedPollData } = await supabase
            .from('polls')
            .select(`
              id,
              question,
              poll_options (
                id,
                text,
                votes ( count )
              )
            `)
            .eq('id', initialPoll.id)
            .single();

          if (updatedPollData) {
            const updatedPoll = updatedPollData as PollWithDetails;
            setPoll(updatedPoll);
            setTotalVotes(calculateTotalVotes(updatedPoll));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialPoll, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOption) return;
    // Insert vote using Supabase client
    const { error } = await supabase.from('votes').insert({
      poll_id: poll.id,
      option_id: selectedOption,
    });

    if (!error) {
      router.push(`/p/${poll.id}/results`);
    } else {
      console.error("Error voting:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">{poll.question}</h1>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {poll.poll_options?.map((option: any) => {
            const voteCount = Array.isArray(option.votes) && option.votes.length > 0 ? option.votes[0].count : 0;
            const percentage = totalVotes > 0 
              ? Math.round((voteCount / totalVotes) * 100) 
              : 0;
            
            return (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={option.id}
                  name="selectedOptionId"
                  value={option.id}
                  onChange={() => setSelectedOption(option.id)}
                  className="radio radio-primary"
                />
                <label htmlFor={option.id} className="flex-1">
                  <div className="flex justify-between">
                    <span>{option.text}</span>
                    <span>{percentage.toFixed(1)}% ({voteCount})</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={percentage}
                    max="100"
                  ></progress>
                </label>
              </div>
            );
          })}
        </div>
        <button type="submit" className="btn btn-primary w-full mt-6" disabled={!selectedOption}>
          Vote
        </button>
      </form>
    </div>
  );
}