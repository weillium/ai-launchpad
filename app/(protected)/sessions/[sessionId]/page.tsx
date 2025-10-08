import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import ChatAgentView from '@/components/agents/ChatAgentView';
import FormAgentView from '@/components/agents/FormAgentView';
import WorkflowAgentView from '@/components/agents/WorkflowAgentView';
import CustomAgentLoader from '@/components/agents/CustomAgentLoader';
import type { Database } from '@/lib/database.types';
import type { SessionRecord } from '@/hooks/useSessions';

export default async function SessionPage({
  params
}: {
  params: { sessionId: string };
}) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('sessions')
    .select('*, agents(*)')
    .eq('id', params.sessionId)
    .single();

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-surface/40 p-10 text-sm text-text-muted">
        Unable to load session. It may have been removed.
      </div>
    );
  }

  const session = data as SessionRecord;
  const agentType = session.agents?.type;

  let content: ReactNode = (
    <div className="rounded-2xl border border-dashed border-border/60 bg-surface/40 p-10 text-sm text-text-muted">
      This agent type is not supported yet.
    </div>
  );

  if (agentType === 'chat') {
    content = <ChatAgentView session={session} />;
  } else if (agentType === 'form') {
    content = <FormAgentView session={session} />;
  } else if (agentType === 'workflow') {
    content = <WorkflowAgentView session={session} />;
  } else if (agentType === 'custom') {
    content = <CustomAgentLoader session={session} />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-text-muted">{session.agents?.name}</p>
        <h1 className="text-3xl font-semibold text-text">{session.title ?? 'Session Workspace'}</h1>
        <p className="text-sm text-text-muted">{session.agents?.description}</p>
      </header>
      {content}
    </div>
  );
}
