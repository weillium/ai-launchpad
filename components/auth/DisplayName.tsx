'use client';

import { useUser } from '@/components/providers/UserProvider';

export default function DisplayName() {
  const { displayName } = useUser();
  
  console.log('📝 DisplayName: Rendering with display name:', displayName);
  
  return (
    <h1 className="text-3xl font-semibold text-text">{displayName}</h1>
  );
}
