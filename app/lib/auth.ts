import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';
import type { Profile } from './types';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profile;
}

export async function getUserRole(userId?: string) {
  const currentUser = userId ? null : await getCurrentUser();
  const id: string | undefined = userId ?? currentUser?.id;
  if (!id) return null;
  const supabase = await createClient();
  const { data, error }: { data: Pick<Profile, 'role'> | null; error: unknown } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
  return data?.role ?? null;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const role = await getUserRole(user.id);
  if (role !== 'admin') {
    redirect('/');
  }
  return user;
}