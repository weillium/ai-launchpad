'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  displayName: string;
  setDisplayName: (name: string) => void;
  userEmail: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  initialEmail: string;
  initialDisplayName?: string;
}

export function UserProvider({ children, initialEmail, initialDisplayName }: UserProviderProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName || initialEmail.split('@')[0] || 'User');
  
  console.log('🏗️ UserProvider: Initializing with:', {
    initialEmail,
    initialDisplayName,
    finalDisplayName: displayName
  });

  return (
    <UserContext.Provider value={{ displayName, setDisplayName, userEmail: initialEmail }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
