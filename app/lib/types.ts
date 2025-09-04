export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Poll {
  id: string;
  question: string;
  description: string | null;
  created_by: string;
  require_auth: boolean;
  single_vote: boolean;
  status: 'open' | 'closed' | 'draft';
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  order_index: number;
  created_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface PollQRCode {
  id: string;
  poll_id: string;
  short_code: string;
  qr_code_data: string;
  created_at: string;
}

export interface PollWithDetails extends Poll {
  poll_options: PollOption[];
  profiles: Profile;
}

export interface PollOptionWithVotes extends PollOption {
  votes_count?: number;
}

export interface CreatePollData {
  question: string;
  description?: string;
  options: string[];
  require_auth: boolean;
  single_vote: boolean;
  expires_at?: Date;
}

export interface UpdatePollData {
  question?: string;
  description?: string;
  options?: string[];
  require_auth?: boolean;
  single_vote?: boolean;
  status?: 'open' | 'closed' | 'draft';
  expires_at?: Date;
}

export interface VoteData {
  poll_id: string;
  option_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
}
