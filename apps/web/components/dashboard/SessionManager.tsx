'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/providers/SessionProvider';
import { useAgentState } from '@/components/providers/AgentStateProvider';
import { useUserProfile } from '@/components/providers/UserProfileProvider';
import { MessageSquare, Save, RotateCcw, Trash2 } from 'lucide-react';

export default function SessionManager() {
  const { 
    activeSession, 
    activeAgentId, 
    updateSessionState, 
    updateSessionTitle,
    deleteSession 
  } = useSession();
  
  const { 
    agentState, 
    updateState, 
    saveState, 
    getStateValue,
    hasStateKey 
  } = useAgentState();
  
  const { autoSaveSessions } = useUserProfile();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load messages from agent state
  useEffect(() => {
    const savedMessages = getStateValue('messages') || [];
    setMessages(savedMessages);
  }, [agentState]);

  // Auto-save when messages change
  useEffect(() => {
    if (autoSaveSessions && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        handleSaveState();
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [messages, autoSaveSessions]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    updateState('messages', updatedMessages);
    setMessage('');

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = {
        id: Date.now() + 1,
        text: `I received your message: "${message}". This is a simulated response.`,
        timestamp: new Date().toISOString(),
        type: 'agent'
      };

      const finalMessages = [...updatedMessages, agentResponse];
      setMessages(finalMessages);
      updateState('messages', finalMessages);
    }, 1000);
  };

  const handleSaveState = async () => {
    if (!activeSession) return;

    try {
      setIsSaving(true);
      await saveState();
      console.log('✅ Session state saved');
    } catch (error) {
      console.error('❌ Failed to save session state:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearMessages = () => {
    setMessages([]);
    updateState('messages', []);
  };

  const handleDeleteSession = async () => {
    if (!activeSession) return;

    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        await deleteSession(activeSession.id);
        console.log('✅ Session deleted');
      } catch (error) {
        console.error('❌ Failed to delete session:', error);
      }
    }
  };

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <MessageSquare className="h-16 w-16 text-text-muted mb-4" />
        <h2 className="text-xl font-semibold text-text mb-2">No Active Session</h2>
        <p className="text-text-muted mb-4">
          Select an agent from the sidebar to start a new conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text">
            {activeSession.title || 'Untitled Session'}
          </h2>
          <p className="text-sm text-text-muted">
            Session started {new Date(activeSession.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveState}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleClearMessages}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/60 text-text-muted hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </button>
          <button
            onClick={handleDeleteSession}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-surface/40 rounded-xl border border-border/60 p-6 min-h-96 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-text-muted mb-3" />
            <p className="text-text-muted">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-background/60 text-text border border-border/60'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 rounded-lg bg-background/60 border border-border/60 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>

      {/* Session Info */}
      <div className="bg-surface/40 rounded-xl border border-border/60 p-4">
        <h3 className="text-sm font-medium text-text mb-2">Session Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Session ID:</span>
            <p className="font-mono text-xs text-text">{activeSession.id}</p>
          </div>
          <div>
            <span className="text-text-muted">Agent ID:</span>
            <p className="font-mono text-xs text-text">{activeSession.agent_id}</p>
          </div>
          <div>
            <span className="text-text-muted">Messages:</span>
            <p className="text-text">{messages.length}</p>
          </div>
          <div>
            <span className="text-text-muted">Auto-save:</span>
            <p className="text-text">{autoSaveSessions ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
