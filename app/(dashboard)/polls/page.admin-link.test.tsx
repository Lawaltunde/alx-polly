import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import PollsPage from './page';

// Mock the Supabase queries (SSR variant used by page)
vi.mock('@/app/lib/supabase/server-queries', () => ({
  getUserPolls: vi.fn(),
  getParticipatedPolls: vi.fn(),
}));

// Mock auth to avoid redirect and return admin role
vi.mock('@/app/lib/auth', () => ({
  requireAuth: vi.fn(async () => ({ id: 'admin-user' })),
  getUserRole: vi.fn(async () => 'admin'),
}));

describe('PollsPage Admin Panel visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows Admin Panel link for admins', async () => {
    const { getUserPolls, getParticipatedPolls } = await import('@/app/lib/supabase/server-queries');
    (getUserPolls as unknown as Mock).mockResolvedValue([]);
    (getParticipatedPolls as unknown as Mock).mockResolvedValue([]);

    render(await PollsPage());

    const adminLink = screen.getByRole('link', { name: 'Admin Panel' });
    expect(adminLink).toHaveAttribute('href', '/admin');
  });
});
