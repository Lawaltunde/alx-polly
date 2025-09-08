'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { PollWithDetails } from '@/app/lib/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PollVoteFormDashboardProps {
  poll: PollWithDetails;
}

export default function PollVoteFormDashboard({ poll }: PollVoteFormDashboardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOption) return;

    const { error } = await supabase.from('votes').insert({
      poll_id: poll.id,
      option_id: selectedOption,
    });

    if (!error) {
      router.push(`/polls/${poll.id}/results`);
    } else {
      console.error("Error voting:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {poll.poll_options?.map((option) => (
          <div key={option.id}>
            <label
              htmlFor={option.id}
              className={`w-full text-left p-4 border rounded-lg flex justify-between items-center cursor-pointer transition-colors ${selectedOption === option.id ? 'bg-blue-100 border-blue-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <span>{option.text}</span>
              <input
                type="radio"
                id={option.id}
                name="option"
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