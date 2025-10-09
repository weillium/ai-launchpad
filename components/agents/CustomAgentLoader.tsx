'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { SessionRecord } from '@/hooks/useSessions';

const registry: Record<string, ReturnType<typeof dynamic>> = {
  'weather-visualizer': dynamic(() => import('@agents/WeatherVisualizer'), {
    ssr: false,
    loading: () => <p className="text-sm text-text-muted">Loading weather visualizer...</p>
  }),
  'text-analyzer': dynamic(() => import('@agents/TextAnalyzer'), {
    ssr: false,
    loading: () => <p className="text-sm text-text-muted">Loading text analyzer...</p>
  })
};

interface CustomAgentLoaderProps {
  session: SessionRecord;
}

export default function CustomAgentLoader({ session }: CustomAgentLoaderProps) {
  const componentKey = (session.agents?.config_json as { component?: string } | null)?.component;
  const Component = componentKey ? registry[componentKey] : null;

  if (!Component) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-surface/40 p-8 text-sm text-text-muted">
        No custom component registered. Update the agent config_json with a valid component key.
      </div>
    );
  }

  return (
    <Suspense fallback={<p className="text-sm text-text-muted">Loading custom agent...</p>}>
      <Component session={session} />
    </Suspense>
  );
}
