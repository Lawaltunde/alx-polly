import { createClient } from './server';
import { 
  Poll, 
  PollOption, 
  Vote, 
  PollQRCode, 
  PollWithDetails, 
  CreatePollData, 
  UpdatePollData, 
  VoteData 
} from '../types';

export async function getPolls(): Promise<PollWithDetails[]> {
  try {
    const supabase = await createClient();
    
    const { data: polls, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (
          *
        ),
        profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching polls:', error);
      return [];
    }

    return polls || [];
  } catch (error) {
    console.error('Network or other error fetching polls:', error);
    return [];
  }
}

export async function getPoll(id: string): Promise<PollWithDetails | null> {
  const supabase = await createClient();
  
  const { data: poll, error } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (
        *
      ),
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Poll not found
    }
    console.error('Error fetching poll:', error);
    throw new Error('Failed to fetch poll');
  }

  return poll;
}

export async function createPoll(pollData: CreatePollData, userId: string): Promise<Poll> {
  const supabase = await createClient();
  
  // Start transaction by creating the poll first
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      question: pollData.question,
      description: pollData.description,
      require_auth: pollData.require_auth,
      single_vote: pollData.single_vote,
      created_by: userId,
      expires_at: pollData.expires_at?.toISOString(),
      status: 'open' 
    })
    .select()
    .single();

  if (pollError) {
    console.error('Error creating poll:', pollError);
    throw new Error('Failed to create poll');
  }

  // Create poll options
  const options = pollData.options.map((option, index) => ({
    poll_id: poll.id,
    text: option,
    order_index: index
  }));

  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(options);

  if (optionsError) {
    console.error('Error creating poll options:', optionsError);
    throw new Error('Failed to create poll options');
  }

  return poll;
}

export async function updatePoll(pollId: string, pollData: UpdatePollData, userId: string): Promise<Poll> {
  const supabase = await createClient();
  
  // Verify ownership
  const { data: existingPoll, error: fetchError } = await supabase
    .from('polls')
    .select('created_by')
    .eq('id', pollId)
    .single();

  if (fetchError || !existingPoll) {
    throw new Error('Poll not found');
  }

  if (existingPoll.created_by !== userId) {
    throw new Error('Unauthorized to update this poll');
  }

  // Update poll
  const { data: poll, error: updateError } = await supabase
    .from('polls')
    .update({
      question: pollData.question,
      description: pollData.description,
      require_auth: pollData.require_auth,
      single_vote: pollData.single_vote,
      status: pollData.status,
      expires_at: pollData.expires_at?.toISOString()
    })
    .eq('id', pollId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating poll:', updateError);
    throw new Error('Failed to update poll');
  }

  // Update options if provided
  if (pollData.options) {
    // Delete existing options
    await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId);

    // Create new options
    const options = pollData.options.map((option, index) => ({
      poll_id: pollId,
      text: option,
      order_index: index
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(options);

    if (optionsError) {
      console.error('Error updating poll options:', optionsError);
      throw new Error('Failed to update poll options');
    }
  }

  return poll;
}

export async function deletePoll(pollId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  
  // Verify ownership
  const { data: poll, error: fetchError } = await supabase
    .from('polls')
    .select('created_by')
    .eq('id', pollId)
    .single();

  if (fetchError || !poll) {
    throw new Error('Poll not found');
  }

  if (poll.created_by !== userId) {
    throw new Error('Unauthorized to delete this poll');
  }

  // Delete poll (cascades to options, votes, and QR codes)
  const { error: deleteError } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId);

  if (deleteError) {
    console.error('Error deleting poll:', deleteError);
    throw new Error('Failed to delete poll');
  }
}

export async function submitVote(voteData: VoteData): Promise<void> {
  const supabase = await createClient();
  
  // Check if poll exists and is open
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

  // Check if user already voted (for single vote polls)
  if (poll.single_vote && voteData.user_id) {
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', voteData.poll_id)
      .eq('user_id', voteData.user_id)
      .single();

    if (existingVote) {
      throw new Error('User has already voted on this poll');
    }
  }

  // Submit vote
  const { error: voteError } = await supabase
    .from('votes')
    .insert({
      poll_id: voteData.poll_id,
      option_id: voteData.option_id,
      user_id: voteData.user_id,
      ip_address: voteData.ip_address,
      user_agent: voteData.user_agent
    });

  if (voteError) {
    console.error('Error submitting vote:', voteError);
    throw new Error('Failed to submit vote');
  }
}

export async function togglePollStatus(pollId: string, userId: string): Promise<Poll> {
  const supabase = await createClient();
  
  // Verify ownership
  const { data: existingPoll, error: fetchError } = await supabase
    .from('polls')
    .select('created_by, status')
    .eq('id', pollId)
    .single();

  if (fetchError || !existingPoll) {
    throw new Error('Poll not found');
  }

  if (existingPoll.created_by !== userId) {
    throw new Error('Unauthorized to update this poll');
  }

  // Toggle status
  const newStatus = existingPoll.status === 'open' ? 'closed' : 'open';
  
  const { data: poll, error: updateError } = await supabase
    .from('polls')
    .update({ status: newStatus })
    .eq('id', pollId)
    .select()
    .single();

  if (updateError) {
    console.error('Error toggling poll status:', updateError);
    throw new Error('Failed to toggle poll status');
  }

  return poll;
}

export async function getUserPolls(userId: string): Promise<PollWithDetails[]> {
  const supabase = await createClient();
  
  const { data: polls, error } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (
        *
      ),
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user polls:', error);
    throw new Error('Failed to fetch user polls');
  }

  return polls || [];
}

export async function getPollVotes(pollId: string): Promise<Vote[]> {
  const supabase = await createClient();
  
  const { data: votes, error } = await supabase
    .from('votes')
    .select('*')
    .eq('poll_id', pollId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching poll votes:', error);
    throw new Error('Failed to fetch poll votes');
  }

  return votes || [];
}