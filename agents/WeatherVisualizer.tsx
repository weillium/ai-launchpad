'use client';

import { useEffect, useState } from 'react';
import type { SessionRecord } from '@/hooks/useSessions';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  location: string;
}

interface WeatherVisualizerProps {
  session: SessionRecord;
}

export default function WeatherVisualizer({ session }: WeatherVisualizerProps) {
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    const saved = (session.session_state as { weather?: WeatherData } | null)?.weather;
    return (
      saved ?? {
        temperature: 72,
        condition: 'Partly Cloudy',
        humidity: 40,
        location: 'San Francisco'
      }
    );
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setWeather((current) =>
        current
          ? {
              ...current,
              temperature: Math.round(current.temperature + (Math.random() * 4 - 2)),
              humidity: Math.min(100, Math.max(10, current.humidity + Math.round(Math.random() * 4 - 2)))
            }
          : current
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!weather) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-text-muted">Current Location</p>
          <h3 className="text-2xl font-semibold text-text">{weather.location}</h3>
        </div>
        <div className="rounded-2xl bg-accent/20 px-4 py-2 text-right text-accent">
          <p className="text-3xl font-bold">{weather.temperature}°F</p>
          <p className="text-sm uppercase tracking-wide">{weather.condition}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">Condition</p>
          <p className="mt-2 text-lg font-medium text-text">{weather.condition}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">Humidity</p>
          <p className="mt-2 text-lg font-medium text-text">{weather.humidity}%</p>
        </div>
      </div>
      <p className="text-xs text-text-muted">
        Example custom agent component. Replace with live weather integrations by invoking Supabase Edge Functions.
      </p>
    </div>
  );
}
