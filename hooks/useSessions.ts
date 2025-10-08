'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import type { Database } from '@/lib/database.types';

export interface SessionRecord
  extends Database['public']['Tables']['sessions']['Row'] {
  agents?: Database['public']['Tables']['agents']['Row'];
}

export function useSessions() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }

    let isMounted = true;

    async function fetchSessions() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*, agents(*)')
        .eq('user_id', user.id)
        .order('last_active_at', { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error('Failed to load sessions', error);
        setSessions([]);
      } else {
        setSessions((data as SessionRecord[]) ?? []);
      }
      setIsLoading(false);
    }

    fetchSessions();

    const channel = supabase
      .channel(`public:sessions:user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `user_id=eq.${user.id}`
        },
        fetchSessions
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  return { sessions, isLoading };
}
