'use client';

import { useEffect, useRef, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import type { Database, Json } from '@/lib/database.types';
import type { SessionRecord } from '@/hooks/useSessions';
import { useWorkspace } from '@/components/providers/WorkspaceProvider';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface ChatAgentViewProps {
  session: SessionRecord;
}

export default function ChatAgentView({ session }: ChatAgentViewProps) {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const { upsertSessionState } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>(() => {
    const history = (session.session_state as { messages?: Message[] } | null)?.messages ?? [];
    return history;
  });
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const outgoing: Message = {
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString()
    };
    const optimistic = [...messages, outgoing];
    setMessages(optimistic);
    setInput('');
    setIsSending(true);

    let updated = optimistic;

    const { data, error } = await supabase.functions.invoke('log-agent-run', {
      body: {
        agentId: session.agent_id,
        sessionId: session.id,
        userId: user.id,
        input: outgoing.content,
        history: optimistic
      }
    });

    if (error) {
      console.error('Failed to send message', error);
      updated = [
        ...optimistic,
        { role: 'assistant', content: 'Something went wrong.', created_at: new Date().toISOString() }
      ];
    } else if (data?.response) {
      updated = [
        ...optimistic,
        {
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString()
        }
      ];
    }

    setMessages(updated);
    const persistedState: Json = { messages: updated };
    await upsertSessionState(session.id, persistedState as Record<string, unknown>);
    setIsSending(false);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface/60">
      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <p className="text-sm text-text-muted">Start the conversation to collaborate with this agent.</p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.created_at}-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-lg rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  message.role === 'user'
                    ? 'bg-accent/80 text-white'
                    : 'bg-background/70 text-text'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>
      <form
        className="flex items-center gap-3 border-t border-border/60 bg-background/70 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask the agent..."
          className="flex-1 rounded-xl border border-border/60 bg-surface/50 px-4 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <button
          type="submit"
          disabled={isSending}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>Send</span>
          <SendHorizonal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
