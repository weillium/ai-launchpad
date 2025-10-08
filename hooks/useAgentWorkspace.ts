'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
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
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [sessions, setSessions] = useState<SessionRecord[]>(initialSessions);

  const refreshAgents = useCallback(async () => {
    const { data } = await supabase.from('agents').select('*').order('name');
    setAgents((data as Agent[]) ?? []);
  }, [supabase]);

  const refreshSessions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sessions')
      .select('*, agents(*)')
      .eq('user_id', user.id)
      .order('last_active_at', { ascending: false });
    setSessions((data as SessionRecord[]) ?? []);
  }, [supabase, user]);

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
      if (!user) throw new Error('User not authenticated');
      const existing = sessions.find((session) => session.agent_id === agent.id);
      if (existing) {
        return existing;
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          agent_id: agent.id,
          user_id: user.id,
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
    [sessions, supabase, user]
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
