'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '@/lib/database.types';

export interface Agent extends Database['public']['Tables']['agents']['Row'] {}

export function useAgents() {
  const supabase = useSupabaseClient<Database>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchAgents() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (!isMounted) return;

      if (error) {
        console.error('Failed to load agents', error);
        setAgents([]);
      } else {
        setAgents(data ?? []);
      }
      setIsLoading(false);
    }

    fetchAgents();

    const channel = supabase
      .channel('public:agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, fetchAgents)
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { agents, isLoading };
}
