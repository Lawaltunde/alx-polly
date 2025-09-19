import 'server-only';
import { createClient } from './server';
import type { VoteData } from '../types';

// Server-only queries that require Next.js server APIs (cookies/headers) or SSR Supabase client
export async function submitVote(voteData: VoteData): Promise<void> {
  const supabase = await createClient();

  // Validate poll exists and is open
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('id, status, single_vote')
    .eq('id', voteData.poll_id)
    .single();

  if (pollError || !poll) {
    throw new Error('Poll not found');
  }

  if (poll.status !== 'open') {
    throw new Error('Poll is not open for voting');
  }

  // Optional pre-check for single-vote polls (authenticated users)
  if (poll.single_vote && voteData.user_id) {
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', voteData.poll_id)
      .eq('user_id', voteData.user_id)
      .maybeSingle();

    if (existingVote) {
      // Already voted; treat as success
      return;
    }
  }

  const { error: voteError } = await supabase
    .from('votes')
    .insert({
      poll_id: voteData.poll_id,
      option_id: voteData.option_id,
      user_id: voteData.user_id,
      ip_address: voteData.ip_address,
      user_agent: voteData.user_agent,
    });

  if (voteError) {
    if ((voteError as any).code === '23505') {
      // Unique violation (single-vote); consider non-fatal
      return;
    }
    throw new Error('Failed to submit vote');
  }
}
