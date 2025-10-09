'use client';

import { useRouter } from 'next/navigation';
import type { Agent } from '@/hooks/useAgents';
import { useWorkspace } from '@/components/providers/WorkspaceProvider';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter();
  const workspace = useWorkspace();

  const handleClick = async () => {
    if (!workspace) {
      console.error('Workspace not available - cannot create session');
      return;
    }
    
    try {
      console.log('🎯 AgentCard: Creating session for agent:', agent.name);
      const session = await workspace.ensureSessionForAgent(agent);
      console.log('✅ AgentCard: Session created:', session);
      router.push(`/sessions/${session.id}`);
    } catch (error) {
      console.error('❌ AgentCard: Error creating session:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!workspace}
      className="group flex flex-col gap-3 rounded-2xl border border-transparent bg-surface/60 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/60 text-2xl">
        {agent.icon ?? '🤖'}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text">{agent.name}</h3>
        <p className="mt-1 text-sm text-text-muted">{agent.description}</p>
      </div>
      <div className="mt-auto text-xs uppercase tracking-wide text-accent/80">
        {agent.type.toUpperCase()}
      </div>
    </button>
  );
}
