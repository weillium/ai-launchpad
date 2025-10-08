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
  const value = useAgentWorkspace({ initialAgents, initialSessions });

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
