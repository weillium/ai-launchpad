'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, PanelLeftClose, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useWorkspace } from '@/components/providers/WorkspaceProvider';
import type { SessionRecord } from '@/hooks/useSessions';

export default function Sidebar() {
  const { sessions } = useWorkspace();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderSession = (session: SessionRecord) => {
    const isActive = pathname?.includes(session.id);
    return (
      <Link
        key={session.id}
        href={`/sessions/${session.id}`}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted/60 ${
          isActive ? 'bg-muted text-text' : 'text-text-muted'
        }`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-accent">
          {session.agents?.icon ?? '🧠'}
        </div>
        <div className="flex flex-1 flex-col">
          <span className="font-medium group-hover:text-text">{session.title ?? session.agents?.name}</span>
          <span className="text-xs text-text-muted">
            {new Date(session.last_active_at).toLocaleDateString()}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-border bg-surface/80 backdrop-blur-lg transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-text">
          <span className="rounded-lg bg-accent/10 px-2 py-1 text-accent">AI</span>
          {!isCollapsed && <span>Launchpad</span>}
        </Link>
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="rounded-full p-2 text-text-muted transition hover:bg-muted hover:text-text"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      <div className="px-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-background/40 px-3 py-2 text-sm text-text-muted transition hover:border-accent/50 hover:bg-background/80 hover:text-text"
        >
          <PlusCircle className="h-4 w-4" />
          {!isCollapsed && <span>Browse Agents</span>}
        </Link>
      </div>
      <div className="mt-6 flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        <p className={`text-xs uppercase tracking-wide text-text-muted ${isCollapsed ? 'text-center' : ''}`}>
          Active Sessions
        </p>
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/60 bg-background/40 p-4 text-center text-xs text-text-muted">
              No active sessions yet.
            </p>
          ) : (
            sessions.map(renderSession)
          )}
        </div>
      </div>
    </aside>
  );
}
