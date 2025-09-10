import { createClient } from "./client";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("id", userId)
    .single();
  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching profile:", error);
    }
    return null;
  }
  return data;
}
