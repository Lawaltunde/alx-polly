'use client';

import { LogOut } from 'lucide-react';
import { useSupabaseClient } from '@/app/lib/supabase/useSupabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const { supabase, ready } = useSupabaseClient();

  const handleLogout = async () => {
  if (!supabase || !ready) return;
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button
      type="button"
      className="flex items-center space-x-2 text-red-500 hover:text-red-600"
      onClick={handleLogout}
  disabled={!ready}
    >
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  );
}