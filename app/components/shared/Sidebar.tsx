"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import React from "react";
import { getProfile } from "@/app/lib/supabase/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sidebar() {

  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = React.useState<{ avatar_url?: string; username?: string } | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  async function fetchProfile() {
    if (user?.id) {
      const data = await getProfile(user.id);
      setProfile(data);
    }
  }

  React.useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // Check role to show Admin Panel link
  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!user?.id) {
        if (active) setIsAdmin(false);
        return;
      }
      try {
        const { createClient } = await import("@/app/lib/supabase/client");
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!error && data?.role === "admin") {
          if (active) setIsAdmin(true);
        } else if (active) {
          setIsAdmin(false);
        }
      } catch (_) {
        if (active) setIsAdmin(false);
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  // Manual refresh button handler
  const handleRefresh = async () => {
    await refreshUser();
    await fetchProfile();
  };

  return (
    <aside className="flex flex-col justify-between w-64 p-4 bg-white border-r dark:bg-gray-800 dark:border-gray-700">
      <nav className="flex flex-col space-y-2">
        <Link
          href="/polls"
          className="px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Dashboard
        </Link>
        <Link
          href="/polls/new"
          className="px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          New Poll
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            aria-label="Open Admin Panel"
            className="px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Admin Panel
          </Link>
        )}
        <Link
          href="/settings"
          className="px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Settings
        </Link>
      </nav>
      {user && (
        <div className="flex items-center p-2 mt-4 space-x-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url || user.user_metadata.avatar_url} />
            <AvatarFallback>
              {user.email?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{profile?.username || user.user_metadata.user_name}</p>
          </div>
        </div>
      )}
    </aside>
  );
}