import AgentCard from './AgentCard';
import type { Agent } from '@/hooks/useAgents';

interface AgentGridProps {
  agents: Agent[];
}

export default function AgentGrid({ agents }: AgentGridProps) {
  if (agents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-surface/40 p-12 text-center text-sm text-text-muted">
        No agents configured yet. Add agents from Supabase to see them here.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
