import { vi, describe, it, expect, beforeEach } from 'vitest';

// We'll mock the server client to return a singleton instance so our overrides are respected
describe('getUserRole', () => {
  let mockRole: 'user' | 'admin' | null = null;

  beforeEach(async () => {
    vi.resetModules();
    mockRole = null;

    // Remock the server module with a singleton
    const singleton: any = {
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
    };

    const serverModulePath = '@/app/lib/supabase/server';
    const mod: any = await import(serverModulePath);
    mod.createClient.mockImplementation(async () => singleton);
  });

  it('returns null when not authenticated', async () => {
    const { getUserRole } = await import('./auth');
    const role = await getUserRole();
    expect(role).toBeNull();
  });

  it('returns role when authenticated (user)', async () => {
    mockRole = 'user';
    const serverModulePath = '@/app/lib/supabase/server';
    const mod: any = await import(serverModulePath);
    const client: any = await mod.createClient();
    client.auth.getUser = vi.fn(async () => ({ data: { user: { id: 'u1' } }, error: null }));

    const { getUserRole } = await import('./auth');
    const role = await getUserRole();
    expect(role).toBe('user');
  });

  it('returns admin role when authenticated (admin)', async () => {
    mockRole = 'admin';
    const serverModulePath = '@/app/lib/supabase/server';
    const mod: any = await import(serverModulePath);
    const client: any = await mod.createClient();
    client.auth.getUser = vi.fn(async () => ({ data: { user: { id: 'u2' } }, error: null }));

    const { getUserRole } = await import('./auth');
    const role = await getUserRole();
    expect(role).toBe('admin');
  });
});
