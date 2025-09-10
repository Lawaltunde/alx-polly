'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { PollWithDetails, PollOptionWithVotes } from '@/app/lib/types';
import { useAuth } from '@/app/context/AuthContext';
import PollResults from '../../components/shared/PollResults';

interface PollVoteFormProps {
  poll: PollWithDetails;
}

export default function PollVoteForm({ poll: initialPoll }: PollVoteFormProps) {
  const { user } = useAuth();
  const [poll, setPoll] = useState(initialPoll);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
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
            .select(
              `
              id,
              question,
              poll_options (
                id,
                text,
                votes ( count )
              )
            `
            )
            .eq('id', initialPoll.id)
            .single();

          if (updatedPollData) {
            const updatedPoll = updatedPollData as PollWithDetails;
            setPoll(updatedPoll);
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
    const { error } = await supabase.from('votes').insert({
      poll_id: poll.id,
      option_id: selectedOption,
      user_id: user?.id ?? null,
      ip_address: null,
      user_agent: null,
    });

    if (!error) {
      setVoted(true);
    } else {
      alert('Vote failed: ' + error.message);
      console.error('Error voting:', error);
    }
  };

  if (voted) {
    return <PollResults pollId={poll.id} onGoBack={() => setVoted(false)} />;
  }

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{poll.question}</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Cast your vote by selecting one of the options below.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {poll.poll_options?.map((option: PollOptionWithVotes) => (
            <div
              key={option.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedOption === option.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onClick={() => setSelectedOption(option.id)}
            >
              <label
                htmlFor={option.id}
                className="flex items-center space-x-4 cursor-pointer"
              >
                <input
                  type="radio"
                  id={option.id}
                  name="selectedOptionId"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                  className="hidden"
                />
                <span className="text-xl text-gray-700 dark:text-gray-200">{option.text}</span>
              </label>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="w-full py-3 mt-6 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          disabled={!selectedOption}
        >
          Vote
        </button>
      </form>
    </div>
  );
}