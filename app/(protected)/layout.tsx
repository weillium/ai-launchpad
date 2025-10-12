import AppShell from '@/components/layout/AppShell';

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>{children}</AppShell>
  );
}
