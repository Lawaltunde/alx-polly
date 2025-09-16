"use server";

import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";

export async function deleteAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  // Delete from profiles table
  await supabase.from("profiles").delete().eq("id", user.id);
  // Sign out user
  await supabase.auth.signOut();
  redirect("/login");
}
