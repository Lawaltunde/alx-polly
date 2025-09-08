"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sidebar() {
  const { user } = useAuth();
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
        <Link
          href="/settings"
          className="px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Settings
        </Link>
      </nav>
      {user && (
        <div className="flex items-center p-2 mt-4 space-x-4">
          <Avatar>
            <AvatarImage src={user.user_metadata.avatar_url} />
            <AvatarFallback>
              {user.email?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.user_metadata.user_name}</p>
          </div>
        </div>
      )}
    </aside>
  );
}