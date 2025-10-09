'use client';

import { createContext, useContext } from 'react';
import type { Agent } from '@/hooks/useAgents';
import type { SessionRecord } from '@/hooks/useSessions';
import { useAgentWorkspace } from '@/hooks/useAgentWorkspace';

interface WorkspaceProviderProps {
  children: React.ReactNode;
  initialAgents?: Agent[];
  initialSessions?: SessionRecord[];
}

const WorkspaceContext = createContext<ReturnType<typeof useAgentWorkspace> | null>(null);

export function WorkspaceProvider({
  children,
  initialAgents,
  initialSessions
}: WorkspaceProviderProps) {
  console.log('🏗️ WorkspaceProvider: Component started rendering');
  console.log('🏗️ WorkspaceProvider: Rendering with:', {
    initialAgents: initialAgents?.length,
    initialSessions: initialSessions?.length
  });
  
  try {
    const value = useAgentWorkspace({ initialAgents, initialSessions });
    console.log('🏗️ WorkspaceProvider: useAgentWorkspace succeeded');
    return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
  } catch (error) {
    console.error('🏗️ WorkspaceProvider: useAgentWorkspace failed:', error);
    // Return a minimal context to prevent crashes
    const fallbackValue = {
      agents: initialAgents || [],
      sessions: initialSessions || [],
      refreshAgents: async () => {
        console.log('🔄 Fallback refreshAgents called');
      },
      refreshSessions: async () => {
        console.log('🔄 Fallback refreshSessions called');
      },
      ensureSessionForAgent: async (agent: any) => {
        console.log('⚠️ WorkspaceProvider: Using fallback ensureSessionForAgent for agent:', agent.name);
        // Return a mock session for the fallback
        return {
          id: `fallback-${agent.id}`,
          agent_id: agent.id,
          user_id: 'fallback-user',
          title: `${agent.name} session`,
          session_state: {},
          created_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
          agents: agent
        };
      },
      upsertSessionState: async () => {
        console.log('💾 Fallback upsertSessionState called');
      }
    };
    console.log('🏗️ WorkspaceProvider: Using fallback context with', fallbackValue.agents.length, 'agents');
    return <WorkspaceContext.Provider value={fallbackValue}>{children}</WorkspaceContext.Provider>;
  }
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  console.log('🔍 useWorkspace: Context value:', !!context);
  if (!context) {
    console.error('❌ useWorkspace: No context found - returning null instead of throwing');
    return null;
  }
  return context;
}
