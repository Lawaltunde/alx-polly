import 'server-only';
import { createClient } from './server';
import type { VoteData, UpdatePollData, Poll, PollWithDetails } from '../types';
import type { SupabaseClient } from '@supabase/supabase-js';

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

// Update a poll (server-only to ensure auth via RLS)
export async function updatePoll(pollId: string, pollData: UpdatePollData, userId: string): Promise<Poll> {
  const supabase = await createClient();

  // Ownership check
  const { data: existingPoll, error: fetchError } = await supabase
    .from('polls')
    .select('created_by')
    .eq('id', pollId)
    .maybeSingle();

  if (fetchError || !existingPoll) {
    throw new Error('Poll not found');
  }
  await checkPollEditPermission(supabase, userId, existingPoll.created_by);

  const updates: Partial<{
    question: string;
    description: string | null;
    require_auth: boolean;
    single_vote: boolean;
    status: string;
    expires_at: string | null;
    visibility: string;
    results_visibility: string;
  }> = {
    question: pollData.question,
    description: pollData.description,
    require_auth: pollData.require_auth,
    single_vote: pollData.single_vote,
    status: pollData.status,
    expires_at: pollData.expires_at?.toISOString(),
  };
  if (typeof pollData.visibility !== 'undefined') updates.visibility = pollData.visibility;
  if (typeof pollData.results_visibility !== 'undefined') updates.results_visibility = pollData.results_visibility;
  const { data: poll, error: updateError } = await supabase
    .from('polls')
    .update(updates)
    .eq('id', pollId)
    .select()
    .maybeSingle();

  if (updateError) {
    throw new Error('Failed to update poll');
  }

  if (poll) return poll as Poll;
  // Fallback fetch if row not returned
  const { data: fetched } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .maybeSingle();
  if (!fetched) throw new Error('Failed to update poll');
  return fetched as Poll;
}

// Toggle poll status (server-only)
export async function togglePollStatus(pollId: string, userId: string): Promise<Poll> {
  const supabase = await createClient();

  const { data: existingPoll, error: fetchError } = await supabase
    .from('polls')
    .select('created_by, status')
    .eq('id', pollId)
    .maybeSingle();

  if (fetchError || !existingPoll) {
    throw new Error('Poll not found');
  }
  await checkPollEditPermission(supabase, userId, existingPoll.created_by);

  const newStatus = existingPoll.status === 'open' ? 'closed' : 'open';

  const { data: poll, error: updateError } = await supabase
    .from('polls')
    .update({ status: newStatus })
    .eq('id', pollId)
    .select()
    .maybeSingle();

  if (updateError) {
    throw new Error('Failed to toggle poll status');
  }
  if (poll) return poll as Poll;
  const { data: fetched } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .maybeSingle();
  if (!fetched) throw new Error('Failed to toggle poll status');
  return fetched as Poll;
}

// Shared authorization helper: owner OR admin via RPC
async function checkPollEditPermission(supabase: SupabaseClient, userId: string, createdBy: string): Promise<void> {
  if (createdBy === userId) return;
  const { data, error } = await supabase.rpc('is_admin', { uid: userId });
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Authorization check failed (is_admin RPC):', error);
    }
    throw new Error('Authorization check failed');
  }
  if (!data) {
    throw new Error('Unauthorized to update this poll');
  }
}

// Fetch a poll with SSR client so RLS uses the authenticated user (owners can view closed polls)
export async function getPoll(pollId: string): Promise<PollWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (
        id,
        text,
        order_index,
        votes:votes(count)
      ),
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('id', pollId)
    .maybeSingle();

  if (error) {
    // If not found due to RLS or genuinely missing, return null
    return null;
  }
  return (data as any) || null;
}

// Fetch all polls for a user (SSR to ensure auth RLS applies and includes closed polls)
export async function getUserPolls(userId: string): Promise<PollWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (*),
      profiles ( id, username, full_name, avatar_url )
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching user polls (SSR):', error);
    }
    return [];
  }
  return (data as any) || [];
}

// Fetch polls the user has participated in (voted on)
export async function getParticipatedPolls(userId: string): Promise<PollWithDetails[]> {
  const supabase = await createClient();

  // Single round-trip: select from votes with an INNER JOIN to polls, pulling nested relations
  const { data, error } = await supabase
    .from('votes')
    .select(`
      polls!inner(
        *,
        poll_options(*),
        profiles(id, username, full_name, avatar_url)
      )
    `)
    .eq('user_id', userId)
    // Order by the related polls.created_at (most recent first)
    .order('created_at', { foreignTable: 'polls', ascending: false });

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching participated polls (SSR, joined):', error);
    }
    return [];
  }

  // Transform rows of shape { polls: PollWithDetails } to a unique list of polls
  const rows = (data as any[]) || [];
  const unique = new Map<string, PollWithDetails>();
  for (const row of rows) {
    const poll = row?.polls as PollWithDetails | undefined;
    if (poll && !unique.has(poll.id)) {
      unique.set(poll.id, poll);
    }
  }
  return Array.from(unique.values());
}

// Admin: list all polls with pagination and optional search/status filter
export async function listPollsForAdmin(params: {
  page?: number;
  pageSize?: number;
  q?: string | null;
  status?: 'open' | 'closed' | null;
  ownerUsername?: string | null;
  sort?: 'created_at' | 'question' | 'status';
  dir?: 'asc' | 'desc';
}): Promise<{
  items: Array<{
    id: string;
    question: string;
    status: string;
    created_at: string;
    owner_username: string | null;
    total_votes: number;
  }>;
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}> {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('polls')
    .select(
      `id, question, status, created_at, created_by,
       profiles(id, username),
       votes(count)`,
      { count: 'exact' }
    )
    .range(from, to);

  if (params.q && params.q.trim().length > 0) {
    // Search by question text (simple ilike)
    query = query.ilike('question', `%${params.q.trim()}%`);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }
  if (params.ownerUsername && params.ownerUsername.trim().length > 0) {
    // Filter on joined profile username using dot path (PostgREST supports dot notation on embedded resources)
    query = (query as any).eq('profiles.username', params.ownerUsername.trim());
  }

  const sort = params.sort ?? 'created_at';
  const dir = params.dir ?? 'desc';
  // Only sort by columns that exist on polls; default to created_at desc
  query = query.order(sort, { ascending: dir === 'asc' });

  const { data, error, count } = await query;
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error listing polls for admin:', error);
    }
    return { items: [], total: 0, page, pageSize, pageCount: 0 };
  }

  const items = (data ?? []).map((row: any) => ({
    id: row.id as string,
    question: row.question as string,
    status: row.status as string,
    created_at: row.created_at as string,
    owner_username: row.profiles?.username ?? null,
    total_votes: Array.isArray(row.votes) && row.votes[0] && typeof row.votes[0].count === 'number'
      ? row.votes[0].count
      : 0,
  }));

  const total = typeof count === 'number' ? count : items.length;
  const pageCount = total === 0 ? 0 : Math.ceil(total / pageSize);
  return { items, total, page, pageSize, pageCount };
}
