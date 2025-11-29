import ProtectedAppShell from '@/components/layout/ProtectedAppShell';

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedAppShell>
      {children}
    </ProtectedAppShell>
  );
}
