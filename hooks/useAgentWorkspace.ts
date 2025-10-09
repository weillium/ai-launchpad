'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '@/lib/database.types';
import type { Agent } from './useAgents';
import type { SessionRecord } from './useSessions';

interface UseAgentWorkspaceOptions {
  initialAgents?: Agent[];
  initialSessions?: SessionRecord[];
}

export function useAgentWorkspace({
  initialAgents = [],
  initialSessions = []
}: UseAgentWorkspaceOptions = {}) {
  console.log('🔧 useAgentWorkspace: Starting with initial data:', {
    agentsCount: initialAgents.length,
    sessionsCount: initialSessions.length
  });

  const supabase = useSupabaseClient<Database>();
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [sessions, setSessions] = useState<SessionRecord[]>(initialSessions);
  const [userId, setUserId] = useState<string | null>(null);

  console.log('🔧 useAgentWorkspace: Supabase client available:', !!supabase);

  // Get user ID from Supabase auth - simplified version
  useEffect(() => {
    console.log('🔧 useAgentWorkspace: Getting user ID from Supabase');
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('🔧 useAgentWorkspace: User data:', { userId: user?.id, error: error?.message });
        setUserId(user?.id || null);
      } catch (err) {
        console.error('🔧 useAgentWorkspace: Error getting user:', err);
        setUserId(null);
      }
    };
    getUser();
  }, [supabase]);

  const refreshAgents = useCallback(async () => {
    const { data } = await supabase.from('agents').select('*').order('name');
    setAgents((data as Agent[]) ?? []);
  }, [supabase]);

  const refreshSessions = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('sessions')
      .select('*, agents(*)')
      .eq('user_id', userId)
      .order('last_active_at', { ascending: false });
    setSessions((data as SessionRecord[]) ?? []);
  }, [supabase, userId]);

  const upsertSessionState = useCallback(
    async (sessionId: string, state: Record<string, unknown>) => {
      await supabase
        .from('sessions')
        .update({ session_state: state, last_active_at: new Date().toISOString() })
        .eq('id', sessionId);
      await refreshSessions();
    },
    [refreshSessions, supabase]
  );

  const ensureSessionForAgent = useCallback(
    async (agent: Agent) => {
      if (!userId) throw new Error('User not authenticated');
      const existing = sessions.find((session) => session.agent_id === agent.id);
      if (existing) {
        return existing;
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          agent_id: agent.id,
          user_id: userId,
          title: `${agent.name} session`,
          session_state: {}
        })
        .select('*, agents(*)')
        .single();

      if (error) throw error;

      const session = data as SessionRecord;
      setSessions((prev) => [session, ...prev]);
      return session;
    },
    [sessions, supabase, userId]
  );

  const value = useMemo(
    () => ({
      agents,
      sessions,
      refreshAgents,
      refreshSessions,
      ensureSessionForAgent,
      upsertSessionState
    }),
    [agents, ensureSessionForAgent, refreshAgents, refreshSessions, sessions, upsertSessionState]
  );

  return value;
}
