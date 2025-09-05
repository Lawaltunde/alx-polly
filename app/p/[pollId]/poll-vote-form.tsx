'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { PollWithDetails } from '@/app/lib/types';

/**
 * Props for the PollVoteForm component.
 * @property {PollWithDetails} poll - The initial poll data, including options and vote counts.
 */
interface PollVoteFormProps {
  poll: PollWithDetails;
}

/**
 * A client-side component that displays a poll and allows users to vote.
 * It subscribes to real-time updates for the poll's votes and updates the UI accordingly.
 * This component is crucial for the interactive voting experience, providing immediate feedback to users.
 * 
 * @param {PollVoteFormProps} { poll: initialPoll } - The initial poll data.
 * @returns {JSX.Element} The rendered poll voting form.
 */
export default function PollVoteForm({ poll: initialPoll }: PollVoteFormProps) {
  const [poll, setPoll] = useState(initialPoll);
  const [totalVotes, setTotalVotes] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    /**
     * Calculates the total number of votes for a poll based on the vote counts of its options.
     * This is a helper function to avoid duplicating the calculation logic.
     * 
     * @param {any} pollData - The poll data, which should include poll_options with votes.
     * @returns {number} The total number of votes.
     */
    const calculateTotalVotes = (pollData: any) => {
      return pollData.poll_options?.reduce((sum: number, option: any) => {
        // The vote count is derived from the 'votes' array, which is a Supabase aggregation.
        const count = Array.isArray(option.votes) && option.votes.length > 0 ? option.votes[0].count : 0;
        return sum + count;
      }, 0) || 0;
    };

    // Set the initial state of the poll and total votes.
    setPoll(initialPoll);
    setTotalVotes(calculateTotalVotes(initialPoll));

    // Subscribe to real-time updates on the 'votes' table for the current poll.
    // This is the core of the real-time functionality, ensuring that the poll results
    // are updated live as new votes come in.
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
        async (payload) => {
          // When a new vote is inserted, refetch the poll data to get the updated vote counts.
          // This is necessary because the real-time event only tells us that a change occurred,
          // not what the new vote counts are.
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
            // Update the component's state with the new poll data, which will trigger a re-render.
            setPoll(updatedPoll);
            setTotalVotes(calculateTotalVotes(updatedPoll));
          }
        }
      )
      .subscribe();

    // Unsubscribe from the channel when the component unmounts to prevent memory leaks.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialPoll, supabase]);

  /**
   * Submits a vote for a specific poll option.
   * This function is called when a user clicks on a voting button.
   * It inserts a new record into the 'votes' table in the database.
   * 
   * @param {string} optionId - The ID of the option that was voted for.
   */
  async function submitVote(optionId: string) {
    const { error } = await supabase
      .from('votes')
      .insert({
        poll_id: poll.id,
        option_id: optionId,
      });

    if (error) {
      // Basic error handling. In a real application, you would want to provide
      // more user-friendly feedback, perhaps with a toast notification.
      console.error('Error inserting vote:', error);
    }
  }

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">{poll.question}</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          {poll.poll_options?.map((option: any) => {
            // Calculate the vote count and percentage for each option to display the results.
            const voteCount = Array.isArray(option.votes) && option.votes.length > 0 ? option.votes[0].count : 0;
            const percentage = totalVotes > 0 
              ? Math.round((voteCount / totalVotes) * 100) 
              : 0;
            
            return (
              <button
                type="button"
                key={option.id}
                onClick={() => submitVote(option.id)}
                className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-gray-600">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  {/* The width of this div is animated to create a smooth visual effect when the vote counts change. */}
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {voteCount} votes
                </div>
              </button>
            );
          })}
        </div>
      </form>
    </div>
  );
}