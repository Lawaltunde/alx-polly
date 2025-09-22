"use client";

import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { UserMenu } from "@/app/components/shared/UserMenu";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";

export default function Header() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) {
        if (active) setIsAdmin(false);
        return;
      }
      try {
        const { createClient } = await import("@/app/lib/supabase/client");
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (!error && data?.role === 'admin' && active) {
          setIsAdmin(true);
        } else if (active) {
          setIsAdmin(false);
        }
      } catch (e) {
        if (active) setIsAdmin(false);
      }
    })();
    return () => { active = false; };
  }, [user]);
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        <Link href="/">Polly</Link>
      </h1>
      <div className="flex items-center space-x-4">
        {isAdmin && (
          <Link href="/admin" className="text-sm font-medium hover:underline">Admin</Link>
        )}
        <ThemeSwitcher />
  <UserMenu />
      </div>
    </header>
  );
}