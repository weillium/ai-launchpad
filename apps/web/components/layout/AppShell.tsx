'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import type { Database } from '@/lib/database.types';

type Agent = Database['public']['Tables']['agents']['Row'];

interface AppShellProps {
  children: React.ReactNode;
  agents: Agent[];
  onCreateSession?: (agentId: string) => void;
}

export default function AppShell({ children, agents, onCreateSession }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background/80">
        <div 
          className="min-h-full"
          style={{
            paddingLeft: '2rem',
            paddingRight: '2rem',
            paddingTop: '2rem',
            paddingBottom: '2rem',
            maxWidth: '80rem',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
