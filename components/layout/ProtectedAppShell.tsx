'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';

interface ProtectedAppShellProps {
  children: React.ReactNode;
}

export default function ProtectedAppShell({ children }: ProtectedAppShellProps) {
  console.log('🎯 ProtectedAppShell: Rendering', { 
    hasChildren: !!children 
  });
  
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
