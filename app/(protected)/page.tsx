import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AgentGrid from '@/components/dashboard/AgentGrid';
import type { Database } from '@/lib/database.types';
import type { Agent } from '@/hooks/useAgents';

export default async function DashboardPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const [{ data: agents }, { data: userProfile }] = await Promise.all([
    supabase.from('agents').select('*').order('name'),
    supabase.auth.getUser()
  ]);

  const userEmail = userProfile.data.user?.email ?? 'Explorer';

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-accent/80">Welcome back</p>
        <h1 className="text-3xl font-semibold text-text">{userEmail}</h1>
        <p className="text-sm text-text-muted">
          Launch modular AI agents. Sessions are saved so you can resume your work anytime.
        </p>
      </header>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">Available Agents</h2>
          <p className="text-xs uppercase tracking-wide text-text-muted">Config-driven &amp; custom</p>
        </div>
        <AgentGrid agents={(agents ?? []) as Agent[]} />
      </section>
    </div>
  );
}
