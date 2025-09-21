'use client';

import { useEffect, useState } from 'react';
import { PollWithDetails } from '@/app/lib/types';
import PollResults from '../../components/shared/PollResults';
import { handleVote } from '@/app/lib/actions';
import { toast } from 'sonner';

interface PollVoteFormProps {
  poll: PollWithDetails;
}


export default function PollVoteForm({ poll: initialPoll }: PollVoteFormProps) {
  const [poll, setPoll] = useState(initialPoll);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);

  // Realtime handling moved to results page; stick to server action for vote.

  // Show a friendly notice if poll is closed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('closed') === '1') {
      toast.warning('This poll is closed and no longer accepts votes.');
      params.delete('closed');
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  if (voted) {
    return <PollResults pollId={poll.id} initialPoll={poll} onGoBack={() => setVoted(false)} />;
  }

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{poll.question}</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Cast your vote by selecting one of the options below.
        </p>
      </div>
      <form action={handleVote} className="space-y-6">
        <input type="hidden" name="pollId" value={poll.id} />
        <input type="hidden" name="source" value="public" />
        <div className="space-y-4">
          {poll.poll_options?.map((option: any) => (
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