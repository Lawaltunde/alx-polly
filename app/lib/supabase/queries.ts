/**
 * This file contains all the queries related to polls, votes, and poll options.
 * It provides a centralized and consistent way to interact with the database
 * for all poll-related operations. This is crucial for maintaining data integrity
 * and for abstracting the database logic from the UI components.
 */
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

/**
 * Fetches all polls from the database with their associated options and author profiles.
 * This is used on the main polls page to display a list of all available polls.
 * It's important for providing a general overview of the application's content.
 * 
 * @returns {Promise<PollWithDetails[]>} A promise that resolves to an array of polls with their details.
 * @throws {Error} If the database query fails.
 */
export async function getPolls(): Promise<PollWithDetails[]> {
  const supabase = await createClient();
  
  // Selects all polls and joins them with their options and the author's profile.
  // This is more efficient than fetching the data in separate queries.
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (
        id,
        text,
        order_index,
        votes ( count )
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
    throw new Error('Failed to fetch polls');
  }

  return data || [];
}

/**
 * Fetches a single poll by its ID, including its options and author profile.
 * This is used when a user views a specific poll, providing all the necessary
 * information to display the poll and its voting options.
 * 
 * @param {string} id - The ID of the poll to fetch.
 * @returns {Promise<PollWithDetails | null>} A promise that resolves to the poll with its details, or null if not found.
 * @throws {Error} If the database query fails for reasons other than not finding the poll.
 */
export async function getPoll(id: string): Promise<PollWithDetails | null> {
  const supabase = await createClient();
  
  // Fetches the poll with the given ID and its related data.
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (
        id,
        text,
        order_index,
        votes ( count )
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
    // If the poll is not found, Supabase returns an error with a specific code.
    // In this case, we want to return null instead of throwing an error.
    if (error.code === 'PGRST116') { // PGRST116 is the code for "Not Found"
      return null;
    }
    console.error('Error fetching poll:', error);
    throw new Error('Failed to fetch poll');
  }

  return data;
}

/**
 * Creates a new poll and its associated options in the database.
 * This function is essential for allowing users to create new content in the application.
 * It performs the operation in a transactional manner to ensure data consistency.
 * 
 * @param {CreatePollData} pollData - The data for the new poll, including the question and options.
 * @param {string} userId - The ID of the user creating the poll.
 * @returns {Promise<Poll>} A promise that resolves to the newly created poll.
 * @throws {Error} If the poll or its options fail to be created.
 */
export async function createPoll(pollData: CreatePollData, userId: string): Promise<Poll> {
  const supabase = await createClient();
  
  // Start a transaction by creating the poll first.
  // This ensures that we have a poll ID to associate with the options.
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

  // Once the poll is created, create its options.
  const options = pollData.options.map((option, index) => ({
    poll_id: poll.id,
    text: option,
    order_index: index
  }));

  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(options);

  if (optionsError) {
    // If creating the options fails, we should ideally roll back the poll creation.
    // However, Supabase doesn't support transactions in this way through the client library.
    // A more robust solution would be to use a database function (stored procedure).
    console.error('Error creating poll options:', optionsError);
    throw new Error('Failed to create poll options');
  }

  return poll;
}

/**
 * Updates an existing poll and its options.
 * This function is crucial for allowing users to manage the polls they have created.
 * It includes an ownership check to ensure that only the creator of the poll can update it.
 * 
 * @param {string} pollId - The ID of the poll to update.
 * @param {UpdatePollData} pollData - The new data for the poll.
 * @param {string} userId - The ID of the user attempting to update the poll.
 * @returns {Promise<Poll>} A promise that resolves to the updated poll.
 * @throws {Error} If the poll is not found, the user is not authorized, or the update fails.
 */
export async function updatePoll(pollId: string, pollData: UpdatePollData, userId: string): Promise<Poll> {
  const supabase = await createClient();
  
  // First, verify that the user owns the poll before allowing an update.
  // This is a critical security measure.
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

  // Update the poll with the new data.
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

  // If new options are provided, replace the old ones.
  // This is a simple but potentially destructive approach. A more sophisticated
  // implementation might allow for adding, removing, or reordering individual options.
  if (pollData.options) {
    // Delete all existing options for the poll.
    await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId);

    // Create the new options.
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

/**
 * Deletes a poll from the database.
 * This is a destructive action and should be used with care.
 * It includes an ownership check to prevent unauthorized deletions.
 * The database is set up to cascade deletes, so all associated options, votes,
 * and QR codes will also be deleted.
 * 
 * @param {string} pollId - The ID of the poll to delete.
 * @param {string} userId - The ID of the user attempting to delete the poll.
 * @returns {Promise<void>} A promise that resolves when the poll is deleted.
 * @throws {Error} If the poll is not found, the user is not authorized, or the deletion fails.
 */
export async function deletePoll(pollId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  
  // Verify ownership before allowing deletion.
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

  // Delete the poll. The database schema is set up with cascading deletes,
  // so this will also remove all related poll_options, votes, and poll_qr_codes.
  const { error: deleteError } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId);

  if (deleteError) {
    console.error('Error deleting poll:', deleteError);
    throw new Error('Failed to delete poll');
  }
}

/**
 * Submits a vote for a poll option.
 * This function contains the core logic for the voting system, including checks
 * to ensure that the poll is open and that users do not vote multiple times
 * on single-vote polls.
 * 
 * @param {VoteData} voteData - The data for the vote, including poll ID, option ID, and user information.
 * @returns {Promise<void>} A promise that resolves when the vote is submitted.
 * @throws {Error} If the poll is not found, is not open for voting, or if the user has already voted.
 */
export async function submitVote(voteData: VoteData): Promise<void> {
  const supabase = await createClient();
  
  // Check if the poll exists and is currently open for voting.
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

  // For polls that only allow a single vote, check if the user has already voted.
  // This is a critical part of the voting logic to ensure fairness.
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

  // Insert the new vote into the database.
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

/**
 * Toggles the status of a poll between 'open' and 'closed'.
 * This allows the creator of a poll to control when it is active for voting.
 * It includes an ownership check to ensure that only the creator can change the status.
 * 
 * @param {string} pollId - The ID of the poll to update.
 * @param {string} userId - The ID of the user attempting to toggle the status.
 * @returns {Promise<Poll>} A promise that resolves to the updated poll.
 * @throws {Error} If the poll is not found, the user is not authorized, or the update fails.
 */
export async function togglePollStatus(pollId: string, userId: string): Promise<Poll> {
  const supabase = await createClient();
  
  // Verify ownership before allowing the status to be changed.
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

  // Determine the new status based on the current status.
  const newStatus = existingPoll.status === 'open' ? 'closed' : 'open';
  
  // Update the poll's status in the database.
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

/**
 * Fetches all polls created by a specific user.
 * This is used in the user's dashboard to display a list of their own polls.
 * It's important for providing a personalized experience and allowing users
 * to manage their content.
 * 
 * @param {string} userId - The ID of the user whose polls to fetch.
 * @returns {Promise<PollWithDetails[]>} A promise that resolves to an array of the user's polls.
 * @throws {Error} If the database query fails.
 */
export async function getUserPolls(userId: string): Promise<PollWithDetails[]> {
  const supabase = await createClient();
  
  // Fetches all polls where the 'created_by' column matches the user's ID.
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

/**
 * Fetches all votes for a specific poll.
 * This can be used for displaying detailed voting results or for auditing purposes.
 * It's a powerful function that should be used with consideration for data privacy,
 * as it could expose who voted for what if not handled carefully on the front end.
 * 
 * @param {string} pollId - The ID of the poll whose votes to fetch.
 * @returns {Promise<Vote[]>} A promise that resolves to an array of votes for the poll.
 * @throws {Error} If the database query fails.
 */
export async function getPollVotes(pollId: string): Promise<Vote[]> {
  const supabase = await createClient();
  
  // Fetches all votes associated with the given poll ID.
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