import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background/80">
        <div className="mx-auto min-h-full max-w-5xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
