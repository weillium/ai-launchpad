'use client';

import { useRouter } from 'next/navigation';
import type { Agent } from '@/hooks/useAgents';
import { useWorkspace } from '@/components/providers/WorkspaceProvider';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter();
  const { ensureSessionForAgent } = useWorkspace();

  const handleClick = async () => {
    const session = await ensureSessionForAgent(agent);
    router.push(`/sessions/${session.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col gap-3 rounded-2xl border border-transparent bg-surface/60 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow"
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
