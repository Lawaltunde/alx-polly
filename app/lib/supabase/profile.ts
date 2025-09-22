import { createClient } from "./client";

export type ProfileRow = {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
  role?: 'user' | 'admin' | null;
};

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, role")
    .eq("id", userId)
    .single();
  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching profile:", error);
    }
    return null;
  }
  return data as ProfileRow;
}
