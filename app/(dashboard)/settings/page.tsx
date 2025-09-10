import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences.
        </p>
      </div>
      <ProfileForm profileAvatarUrl={profile?.avatar_url} />
    </div>
  );
}