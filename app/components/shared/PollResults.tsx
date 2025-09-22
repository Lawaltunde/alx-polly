"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/app/lib/supabase/useSupabaseClient";
import { getPoll, getPollOptionResults } from "@/app/lib/supabase/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PollChart from "./PollChart";
import { toast } from "sonner";

// Ensure consistent types; use type-only import to avoid runtime bundling
import type { Poll, PollWithDetails } from '@/app/lib/types';

type PollResultsProps = {
  pollId: string;
  initialPoll?: Poll | undefined;
  onGoBack?: () => void;
  backPath?: string; // optional explicit back path (e.g., public poll page)
};

export default function PollResults({ pollId, initialPoll, onGoBack, backPath }: PollResultsProps) {
  type PollLike = Poll | PollWithDetails;
  const [poll, setPoll] = useState<PollLike | null>(initialPoll ?? null);
  const [optionResults, setOptionResults] = useState<Array<{ id: string; text: string; vote_count: number }>>([]);

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        // Always fetch poll if missing or incomplete
        if (!initialPoll) {
          const pollData = await getPoll(pollId);
          if (pollData) setPoll(pollData as PollLike);
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') console.warn('Failed to fetch poll in PollResults:', e);
      }
      try {
        // Fetch poll option results from backend view; if blocked by RLS, fallback to zero counts
        const results = await getPollOptionResults(pollId);
        setOptionResults(results ?? []);
        if (process.env.NODE_ENV === "development") {
          console.log("Poll option results:", results);
        }
      } catch (e) {
        setOptionResults([]);
        if (process.env.NODE_ENV === 'development') console.warn('Failed to fetch option results:', e);
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
          setPoll((updatedPoll ?? null) as PollLike | null);
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

  if (!poll && optionResults.length === 0) {
    return <div>Loading poll results...</div>;
  }

  // No hard error on missing options; results may still be viewable via aggregation/RLS

  const chartOptions = optionResults.map(option => ({
    id: option.id,
    text: option.text,
    votes: option.vote_count ?? 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll?.question || 'Poll results'}</CardTitle>
      </CardHeader>
      <CardContent>
        <PollChart options={chartOptions} totalVotes={totalVotes} />
  <p className="text-right mt-4 text-sm text-muted-foreground">{`Total Votes: ${totalVotes}`}</p>
        <button
          onClick={
            onGoBack
              ?? (() => {
                // Prefer explicit backPath when provided
                if (backPath) {
                  window.location.href = backPath;
                  return;
                }
                // Infer from current path: if public namespace, go to public poll
                const path = typeof window !== 'undefined' ? window.location.pathname : '';
                if (path.startsWith('/p/')) {
                  window.location.href = `/p/${pollId}`;
                } else {
                  window.location.href = '/polls';
                }
              })
          }
          className="w-full mt-4 py-2 px-4 bg-muted rounded-md hover:brightness-110"
        >
          Go Back
        </button>
      </CardContent>
    </Card>
  );
}