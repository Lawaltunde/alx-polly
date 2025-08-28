'use client';

import { logout } from '@/app/lib/actions';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center space-x-2 text-red-500 hover:text-red-600"
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </form>
  );
}