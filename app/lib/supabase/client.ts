import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

export async function createClient(accessToken?: string, refreshToken?: string): Promise<SupabaseClient> {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  if (accessToken && refreshToken) {
    try {
      await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    } catch (err: any) {
      if (err instanceof Error) {
        console.error("Error setting Supabase session:", err.message, err.stack);
      } else {
        console.error("Error setting Supabase session:", JSON.stringify(err));
      }
      // Rethrow or return rejected Promise to prevent invalid auth state
      return Promise.reject(err);
    }
  }
  // If refreshToken is missing, treat as unauthenticated: do not call setSession
  return client;
}