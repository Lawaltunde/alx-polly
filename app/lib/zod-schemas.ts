
import { z } from 'zod';

// Schema for the profiles table
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().nullable(),
  full_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
});

// Schema for the polls table
export const PollSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  description: z.string().nullable(),
  created_by: z.string().uuid(),
  require_auth: z.boolean().default(false),
  single_vote: z.boolean().default(true),
  status: z.enum(['open', 'closed', 'draft']).default('open'),
  expires_at: z.string().datetime().nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
});

// Schema for the poll_options table
export const PollOptionSchema = z.object({
  id: z.string().uuid(),
  poll_id: z.string().uuid(),
  text: z.string(),
  order_index: z.number().int(),
  created_at: z.string().datetime().nullable(),
});

// Schema for the votes table
export const VoteSchema = z.object({
  id: z.string().uuid(),
  poll_id: z.string().uuid(),
  option_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  ip_address: z.string().ip().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string().datetime().nullable(),
});

// Schema for the poll_qr_codes table
export const PollQrCodeSchema = z.object({
  id: z.string().uuid(),
  poll_id: z.string().uuid(),
  short_code: z.string(),
  qr_code_data: z.string(),
  created_at: z.string().datetime().nullable(),
});
