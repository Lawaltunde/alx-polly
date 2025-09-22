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
  const user = userId ? { id: userId } : await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', (user as any).id)
    .single();
  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
  return (data as Pick<Profile, 'role'> | null)?.role ?? null;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const role = await getUserRole(user.id);
  if (role !== 'admin') {
    redirect('/');
  }
  return user;
}