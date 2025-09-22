import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as server from '@/app/lib/supabase/server';

// We'll mock the server client to return a singleton instance so our overrides are respected
describe('getUserRole', () => {
  let mockRole: 'user' | 'admin' | null = null;
  let singleton: any;

  const makeSingleton = () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(async () => ({ data: mockRole != null ? { role: mockRole } : null, error: null })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    mockRole = null;
    singleton = makeSingleton();
    // Ensure createClient returns our singleton client
    (server.createClient as unknown as { mockImplementation: Function }).mockImplementation(async () => singleton);
  });

  it('returns null when not authenticated', async () => {
    const { getUserRole } = await import('./auth');
    const role = await getUserRole();
    expect(role).toBeNull();
  });

  it('returns role when authenticated (user)', async () => {
    mockRole = 'user';
    singleton.auth.getUser = vi.fn(async () => ({ data: { user: { id: 'u1' } }, error: null }));

    const { getUserRole } = await import('./auth');
    const role = await getUserRole();
    expect(role).toBe('user');
  });

  it('returns admin role when authenticated (admin)', async () => {
    mockRole = 'admin';
    singleton.auth.getUser = vi.fn(async () => ({ data: { user: { id: 'u2' } }, error: null }));

    const { getUserRole } = await import('./auth');
    const role = await getUserRole();
    expect(role).toBe('admin');
  });
});
