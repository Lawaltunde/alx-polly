import { createBrowserClient } from "@supabase/ssr";

export function createClient(accessToken?: string, refreshToken?: string) {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  if (accessToken && refreshToken) {
    try {
      client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    } catch (err) {
      console.error("Error setting Supabase session:", err);
    }
  }
  // If refreshToken is missing, treat as unauthenticated: do not call setSession
  return client;
}