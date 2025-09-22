'use client';

import { useEffect, useState } from 'react';
import { PollWithDetails } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { handleVote } from '@/app/lib/actions';
import { toast } from 'sonner';

interface PollVoteFormDashboardProps {
  poll: PollWithDetails;
}

export default function PollVoteFormDashboard({ poll }: PollVoteFormDashboardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
  return (
    <form action={handleVote}>
      <input type="hidden" name="pollId" value={poll.id} />
      <input type="hidden" name="source" value="dashboard" />
      <div className="space-y-4">
        {poll.poll_options?.map((option) => (
          <div key={option.id}>
            <label
              htmlFor={option.id}
              className={`w-full text-left p-4 border rounded-lg flex justify-between items-center cursor-pointer transition-colors ${selectedOption === option.id ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-muted'}`}
            >
              <span>{option.text}</span>
              <input
                type="radio"
                id={option.id}
                name="selectedOptionId"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => setSelectedOption(option.id)}
                className="hidden"
              />
            </label>
          </div>
        ))}
      </div>
      <Button type="submit" disabled={!selectedOption} className="w-full mt-6">
        Vote
      </Button>
    </form>
  );
}