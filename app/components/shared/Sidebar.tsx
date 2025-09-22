"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import React from "react";
import { getProfile, type ProfileRow } from "@/app/lib/supabase/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sidebar() {

  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = React.useState<ProfileRow | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  async function fetchProfile() {
    if (!user?.id) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    const data = await getProfile(user.id);
    setProfile(data);
    setIsAdmin(data?.role === 'admin');
  }

  React.useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // role is set within fetchProfile; no separate effect needed

  // Manual refresh button handler
  const handleRefresh = async () => {
    await refreshUser();
    await fetchProfile();
  };

  return (
    <aside className="flex flex-col justify-between w-64 p-4 bg-card border-r border-border">
      <nav className="flex flex-col space-y-2">
        <Link
          href="/polls"
          className="px-4 py-2 rounded-md hover:bg-muted"
        >
          Dashboard
        </Link>
        <Link
          href="/polls/new"
          className="px-4 py-2 rounded-md hover:bg-muted"
        >
          New Poll
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            aria-label="Open Admin Panel"
            className="px-4 py-2 rounded-md hover:bg-muted"
          >
            Admin Panel
          </Link>
        )}
        <Link
          href="/settings"
          className="px-4 py-2 rounded-md hover:bg-muted"
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