'use client';

import { LogOut } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button
      type="button"
      className="flex items-center space-x-2 text-red-500 hover:text-red-600"
      onClick={handleLogout}
    >
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  );
}