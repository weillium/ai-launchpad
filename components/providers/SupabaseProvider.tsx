'use client';

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import {
  SessionContextProvider,
  type Session
} from '@supabase/auth-helpers-react';
import { useState } from 'react';
import type { Database } from '@/lib/database.types';

interface SupabaseProviderProps {
  children: React.ReactNode;
  initialSession: Session | null;
}

export default function SupabaseProvider({
  children,
  initialSession
}: SupabaseProviderProps) {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  );
}
