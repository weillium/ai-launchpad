'use client';

import { useState } from 'react';
import type { Agent } from '@/hooks/useAgents';
import { useSession } from '@/components/providers/SessionProvider';

interface AgentModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentModal({ agent, isOpen, onClose }: AgentModalProps) {
  const { createSession } = useSession();
  const [isLaunching, setIsLaunching] = useState(false);

  if (!isOpen || !agent) return null;

  const handleLaunchAgent = async () => {
    if (!agent) return;
    
    try {
      setIsLaunching(true);
      console.log('🚀 AgentModal: Launching agent:', agent.name);
      
      const newSession = await createSession(agent.id, `${agent.name} Session`);
      console.log('✅ AgentModal: Agent launched successfully:', newSession.id);
      
      onClose();
    } catch (error) {
      console.error('❌ AgentModal: Failed to launch agent:', error);
      // You could add error handling UI here if needed
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-background/60 text-3xl">
              {agent.icon ?? '🤖'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text">{agent.name}</h2>
              <p className="text-sm uppercase tracking-wide text-accent/80">
                {agent.type.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-2">Description</h3>
            <p className="text-text-muted">
              {agent.description || 'No description available.'}
            </p>
          </div>

          {/* Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-2">Configuration</h3>
            <div className="bg-background/40 rounded-lg p-4">
              <pre className="text-sm text-text-muted whitespace-pre-wrap">
                {agent.config_json ? JSON.stringify(agent.config_json, null, 2) : 'No configuration available.'}
              </pre>
            </div>
          </div>

          {/* Agent Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-text mb-1">Type</h4>
              <p className="text-sm text-text-muted">{agent.type}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-1">Created</h4>
              <p className="text-sm text-text-muted">
                {new Date(agent.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-1">ID</h4>
              <p className="text-sm text-text-muted font-mono">{agent.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-1">Icon</h4>
              <p className="text-sm text-text-muted">{agent.icon || 'Default'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleLaunchAgent}
            disabled={isLaunching}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLaunching ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Launching...
              </div>
            ) : (
              'Launch Agent'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
