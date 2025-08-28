import { cookies } from 'next/headers';

export async function isAuthenticated() {
  const session = cookies().get('session');
  return !!session;
}

export async function setSession(userId: string) {
  cookies().set('session', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function clearSession() {
  cookies().delete('session');
}