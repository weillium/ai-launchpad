'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import UserSettingsModal from './UserSettingsModal';

interface SettingsButtonProps {
  userEmail: string;
}

export default function SettingsButton({ userEmail }: SettingsButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm text-text-muted transition hover:border-accent/50 hover:bg-background/80 hover:text-text"
        aria-label="User settings"
      >
        <Settings className="h-4 w-4" />
        Settings
      </button>
      
      <UserSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={userEmail}
      />
    </>
  );
}
