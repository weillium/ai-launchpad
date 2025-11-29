'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import type { Database } from '@/lib/database.types';
import type { Session } from '@supabase/supabase-js';

interface SupabaseProviderProps {
  children: React.ReactNode;
  initialSession: Session | null;
}

export default function SupabaseProvider({
  children,
  initialSession
}: SupabaseProviderProps) {
  const [supabaseClient] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  );
}
