'use client';

import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/database.types';

export default function LogoutButton() {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm text-text-muted transition hover:border-accent/50 hover:bg-background/80 hover:text-text"
      aria-label="Sign out"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
