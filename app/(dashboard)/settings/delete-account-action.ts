"use server";

import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";

export async function deleteAccountAction() {
  const supabase = await createClient();
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting user in deleteAccountAction:", error);
      }
      redirect("/login");
    }
    user = data?.user;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Exception in getUser in deleteAccountAction:", err);
    }
    redirect("/login");
  }
  if (!user) {
    redirect("/login");
  }
  // Delete from profiles table
  const { data: profileData, error: profileError } = await supabase.from("profiles").delete().eq("id", user.id);
  if (profileError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting profile in deleteAccountAction:", profileError);
    }
    // Attempt to rollback: do not sign out, surface error to UI
    return { success: false, error: "Failed to delete profile. Account deletion aborted." };
  }

  // Sign out user only after successful profile deletion
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error signing out after profile deletion:", signOutError);
    }
    // Optionally attempt to rollback: try to recreate profile if possible (not implemented here)
    return { success: false, error: "Profile deleted, but failed to sign out. Please try again or contact support." };
  }
  // Success
  redirect("/login");
}
