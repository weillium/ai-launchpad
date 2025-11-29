'use client';

import { useState } from 'react';
import type { Agent } from '@/hooks/useAgents';
import AgentModal from './AgentModal';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    console.log('🎯 AgentCard: Opening modal for agent:', agent.name);
    setIsModalOpen(true);
  };

  return (
    <>
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

      <AgentModal
        agent={agent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
