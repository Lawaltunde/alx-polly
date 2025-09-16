import { createBrowserClient } from "@supabase/ssr";

export function createClient(accessToken?: string) {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  if (accessToken) {
    client.auth.setSession({ access_token: accessToken, refresh_token: "" });
  }
  return client;
}