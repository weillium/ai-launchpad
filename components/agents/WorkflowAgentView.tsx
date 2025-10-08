'use client';

import { useState } from 'react';
import type { SessionRecord } from '@/hooks/useSessions';
import { useWorkspace } from '@/components/providers/WorkspaceProvider';

interface WorkflowAgentViewProps {
  session: SessionRecord;
}

interface NodeItem {
  id: string;
  label: string;
  type: 'input' | 'action' | 'output';
}

export default function WorkflowAgentView({ session }: WorkflowAgentViewProps) {
  const [nodes, setNodes] = useState<NodeItem[]>(() => {
    const saved = (session.session_state as { nodes?: NodeItem[] } | null)?.nodes;
    return saved ?? [
      { id: 'input-1', label: 'User Input', type: 'input' },
      { id: 'llm-1', label: 'LLM Call', type: 'action' },
      { id: 'output-1', label: 'Result', type: 'output' }
    ];
  });
  const { upsertSessionState } = useWorkspace();

  const handleAddNode = () => {
    const newNode: NodeItem = {
      id: `node-${Date.now()}`,
      label: `Step ${nodes.length + 1}`,
      type: 'action'
    };
    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    void upsertSessionState(session.id, { nodes: nextNodes } as Record<string, unknown>);
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-surface/60 p-8">
      <div>
        <h2 className="text-xl font-semibold text-text">Workflow Builder</h2>
        <p className="mt-2 text-sm text-text-muted">
          Design workflows visually. Drag-and-drop interactions can be integrated with a canvas library in
          future iterations. For now, manage ordered steps.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm transition hover:border-accent/50"
          >
            <p className="text-xs uppercase tracking-wide text-text-muted">{node.type}</p>
            <p className="mt-2 text-lg font-medium text-text">{node.label}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddNode}
        className="rounded-xl border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium text-text transition hover:border-accent/50 hover:text-accent"
      >
        Add workflow step
      </button>
    </div>
  );
}
