'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '@/lib/database.types';

type Session = Database['public']['Tables']['sessions']['Row'];
type SessionInsert = Database['public']['Tables']['sessions']['Insert'];

interface SessionContextType {
  // Active session management
  activeSessionId: string | null;
  activeAgentId: string | null;
  activeSession: Session | null;
  
  // Session list
  userSessions: Session[];
  loading: boolean;
  
  // Actions
  createSession: (agentId: string, title?: string) => Promise<Session>;
  switchSession: (sessionId: string) => Promise<void>;
  updateSessionState: (sessionId: string, state: any) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  clearActiveSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient<Database>() as any;

  // Load user sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user?.id) {
          console.log('🔍 SessionProvider: No user found');
          setUserSessions([]);
          return;
        }

        console.log('📋 SessionProvider: Loading sessions for user:', userData.user.id);

        const { data: sessions, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('last_active_at', { ascending: false });

        if (error) {
          console.error('❌ SessionProvider: Error loading sessions:', error);
          return;
        }

        setUserSessions(sessions || []);
        console.log('📋 SessionProvider: Loaded sessions:', sessions?.length || 0);

        // Set active session to most recent if none selected (only on initial load)
        if (sessions && sessions.length > 0 && !activeSessionId) {
          setActiveSessionId(sessions[0].id);
          setActiveAgentId(sessions[0].agent_id);
          setActiveSession(sessions[0]);
        }
        
      } catch (error) {
        console.error('❌ SessionProvider: Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [supabase]);

  // Create new session
  const createSession = async (agentId: string, title?: string): Promise<Session> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.id) {
        throw new Error('No user ID found');
      }

      console.log('🆕 SessionProvider: Creating session for agent:', agentId);

      const sessionData: SessionInsert = {
        user_id: userData.user.id,
        agent_id: agentId,
        title: title || `Session ${new Date().toLocaleDateString()}`,
        session_state: {},
        last_active_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('❌ SessionProvider: Error creating session:', error);
        throw error;
      }

      console.log('✅ SessionProvider: Session created:', data.id);

      // Add to local state
      setUserSessions(prev => [data, ...prev]);
      
      // Set as active session
      setActiveSessionId(data.id);
      setActiveAgentId(data.agent_id);
      setActiveSession(data);

      return data;
      
    } catch (error) {
      console.error('❌ SessionProvider: Create session error:', error);
      throw error;
    }
  };

  // Switch to different session
  const switchSession = async (sessionId: string) => {
    try {
      const session = userSessions.find(s => s.id === sessionId);
      if (!session) {
        console.error('❌ SessionProvider: Session not found:', sessionId);
        return;
      }

      console.log('🔄 SessionProvider: Switching to session:', sessionId);

      // Update last_active_at
      await supabase
        .from('sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', sessionId);

      setActiveSessionId(sessionId);
      setActiveAgentId(session.agent_id);
      setActiveSession(session);

      console.log('✅ SessionProvider: Switched to session successfully');
      
    } catch (error) {
      console.error('❌ SessionProvider: Switch session error:', error);
      throw error;
    }
  };

  // Update session state
  const updateSessionState = async (sessionId: string, state: any) => {
    try {
      console.log('💾 SessionProvider: Updating session state:', sessionId);

      const { error } = await supabase
        .from('sessions')
        .update({ 
          session_state: state,
          last_active_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('❌ SessionProvider: Error updating session state:', error);
        throw error;
      }

      // Update local state
      setUserSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, session_state: state, last_active_at: new Date().toISOString() }
          : session
      ));

      if (activeSessionId === sessionId) {
        setActiveSession(prev => prev ? { ...prev, session_state: state } : null);
      }

      console.log('✅ SessionProvider: Session state updated');
      
    } catch (error) {
      console.error('❌ SessionProvider: Update state error:', error);
      throw error;
    }
  };

  // Update session title
  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      console.log('📝 SessionProvider: Updating session title:', sessionId, title);

      const { error } = await supabase
        .from('sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) {
        console.error('❌ SessionProvider: Error updating session title:', error);
        throw error;
      }

      // Update local state
      setUserSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, title }
          : session
      ));

      if (activeSessionId === sessionId) {
        setActiveSession(prev => prev ? { ...prev, title } : null);
      }

      console.log('✅ SessionProvider: Session title updated');
      
    } catch (error) {
      console.error('❌ SessionProvider: Update title error:', error);
      throw error;
    }
  };

  // Delete session
  const deleteSession = async (sessionId: string) => {
    try {
      console.log('🗑️ SessionProvider: Deleting session:', sessionId);

      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('❌ SessionProvider: Error deleting session:', error);
        throw error;
      }

      // Remove from local state
      setUserSessions(prev => prev.filter(session => session.id !== sessionId));

      // Clear active session if it was deleted
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setActiveAgentId(null);
        setActiveSession(null);
      }

      console.log('✅ SessionProvider: Session deleted');
      
    } catch (error) {
      console.error('❌ SessionProvider: Delete session error:', error);
      throw error;
    }
  };

  // Refresh sessions
  const refreshSessions = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.id) return;

      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('last_active_at', { ascending: false });

      if (error) {
        console.error('❌ SessionProvider: Error refreshing sessions:', error);
        return;
      }

      setUserSessions(sessions || []);
      console.log('🔄 SessionProvider: Sessions refreshed');
      
    } catch (error) {
      console.error('❌ SessionProvider: Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear active session
  const clearActiveSession = () => {
    console.log('🏠 SessionProvider: Clearing active session');
    setActiveSessionId(null);
    setActiveAgentId(null);
    setActiveSession(null);
  };

  const value: SessionContextType = {
    activeSessionId,
    activeAgentId,
    activeSession,
    userSessions,
    loading,
    createSession,
    switchSession,
    updateSessionState,
    updateSessionTitle,
    deleteSession,
    refreshSessions,
    clearActiveSession
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
