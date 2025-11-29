'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from './SessionProvider';

interface AgentStateContextType {
  // Current agent state
  agentState: Record<string, any>;
  agentType: 'chat' | 'form' | 'workflow' | 'custom' | null;
  
  // State management
  updateState: (key: string, value: any) => void;
  setState: (newState: Record<string, any>) => void;
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
  
  // State helpers
  getStateValue: (key: string) => any;
  hasStateKey: (key: string) => boolean;
  clearState: () => void;
}

const AgentStateContext = createContext<AgentStateContextType | undefined>(undefined);

interface AgentStateProviderProps {
  children: ReactNode;
}

export function AgentStateProvider({ children }: AgentStateProviderProps) {
  const [agentState, setAgentState] = useState<Record<string, any>>({});
  const [agentType, setAgentType] = useState<'chat' | 'form' | 'workflow' | 'custom' | null>(null);
  const { activeSession, updateSessionState } = useSession();

  // Load state when session changes
  useEffect(() => {
    if (activeSession) {
      loadState();
    } else {
      // Clear state when no active session
      setAgentState({});
      setAgentType(null);
    }
  }, [activeSession]);

  // Load state from session
  const loadState = async () => {
    if (!activeSession) return;

    try {
      console.log('📥 AgentStateProvider: Loading state for session:', activeSession.id);
      
      const state = activeSession.session_state as Record<string, any> || {};
      setAgentState(state);
      
      // Determine agent type from session (could be enhanced to fetch from agents table)
      // For now, we'll infer from state structure or use a default
      setAgentType('chat'); // Default type, could be enhanced
      
      console.log('✅ AgentStateProvider: State loaded:', Object.keys(state));
      
    } catch (error) {
      console.error('❌ AgentStateProvider: Error loading state:', error);
    }
  };

  // Save state to session
  const saveState = async () => {
    if (!activeSession) {
      console.warn('⚠️ AgentStateProvider: No active session to save state');
      return;
    }

    try {
      console.log('💾 AgentStateProvider: Saving state for session:', activeSession.id);
      
      await updateSessionState(activeSession.id, agentState);
      console.log('✅ AgentStateProvider: State saved successfully');
      
    } catch (error) {
      console.error('❌ AgentStateProvider: Error saving state:', error);
      throw error;
    }
  };

  // Update a specific state key
  const updateState = (key: string, value: any) => {
    console.log('🔄 AgentStateProvider: Updating state key:', key);
    
    setAgentState(prev => {
      const newState = { ...prev, [key]: value };
      console.log('📝 AgentStateProvider: New state:', Object.keys(newState));
      return newState;
    });
  };

  // Set entire state
  const setState = (newState: Record<string, any>) => {
    console.log('🔄 AgentStateProvider: Setting entire state');
    
    setAgentState(newState);
  };

  // Get state value
  const getStateValue = (key: string) => {
    return agentState[key];
  };

  // Check if state has key
  const hasStateKey = (key: string) => {
    return key in agentState;
  };

  // Clear state
  const clearState = () => {
    console.log('🗑️ AgentStateProvider: Clearing state');
    
    setAgentState({});
  };

  const value: AgentStateContextType = {
    agentState,
    agentType,
    updateState,
    setState,
    saveState,
    loadState,
    getStateValue,
    hasStateKey,
    clearState
  };

  return (
    <AgentStateContext.Provider value={value}>
      {children}
    </AgentStateContext.Provider>
  );
}

export function useAgentState() {
  const context = useContext(AgentStateContext);
  if (context === undefined) {
    throw new Error('useAgentState must be used within an AgentStateProvider');
  }
  return context;
}
