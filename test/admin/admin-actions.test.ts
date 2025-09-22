import { describe, it, expect, vi, beforeEach } from 'vitest';

// Ensure Next.js server-only marker is mocked at transform time
vi.mock('server-only', () => ({}));

// We will call the server-only functions through dynamic import to keep server-only markers isolated

describe('Admin bypass actions', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('allows admin to update another user\'s poll', async () => {
    // Mock server createClient
    vi.doMock('@/app/lib/supabase/server', () => {
      const pollRow = { created_by: 'owner-1', status: 'open' };
      const client = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: pollRow, error: null })) })) })),
          update: vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { id: 'p1', status: 'open' }, error: null })) })) })) })),
        })),
        rpc: vi.fn(async (_name: string, _args: any) => ({ data: true, error: null })),
      };
      return { createClient: vi.fn(async () => client) };
    });

    const { updatePoll } = await import('@/app/lib/supabase/server-queries');
    const result = await updatePoll('p1', { question: 'Q?' }, 'admin-1');
    expect(result).toBeTruthy();
  });

  it('allows admin to toggle another user\'s poll status', async () => {
    vi.doMock('@/app/lib/supabase/server', () => {
      const pollRow = { created_by: 'owner-1', status: 'open' };
      const client = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: pollRow, error: null })) })) })),
          update: vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { id: 'p1', status: 'closed' }, error: null })) })) })) })),
        })),
        rpc: vi.fn(async () => ({ data: true, error: null })),
      };
      return { createClient: vi.fn(async () => client) };
    });

    const { togglePollStatus } = await import('@/app/lib/supabase/server-queries');
    const result = await togglePollStatus('p1', 'admin-1');
    expect(result.status).toBe('closed');
  });

  it('allows admin to delete another user\'s poll', async () => {
    // deletePoll uses browser client in codepath, but accepts a client in args; we pass a mocked client
    const mockClient: any = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(async () => ({ data: { created_by: 'owner-1' }, error: null })) })) })),
        delete: vi.fn(() => ({ eq: vi.fn(() => ({ error: null, data: [{ id: 'p1' }] })) })),
      })),
      rpc: vi.fn(async () => ({ data: true, error: null })),
    };

    const { deletePoll } = await import('@/app/lib/supabase/queries');
    await expect(deletePoll(mockClient, 'p1', 'admin-1')).resolves.not.toThrow();
  });
});
