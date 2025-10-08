'use client';

import { useEffect, useState } from 'react';
import type { Database, Json } from '@/lib/database.types';
import type { SessionRecord } from '@/hooks/useSessions';
import { useWorkspace } from '@/components/providers/WorkspaceProvider';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface FormAgentConfig {
  fields: FieldConfig[];
  submitLabel?: string;
}

interface FormAgentViewProps {
  session: SessionRecord;
}

export default function FormAgentView({ session }: FormAgentViewProps) {
  const config = (session.agents?.config_json as FormAgentConfig | null) ?? { fields: [] };
  const { upsertSessionState } = useWorkspace();
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const state = (session.session_state as { values?: Record<string, string> } | null)?.values;
    return state ?? {};
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setStatus(null);
  }, [session.id]);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    await upsertSessionState(session.id, { values } as Record<string, unknown>);
    const { error } = await supabase.functions.invoke('log-agent-run', {
      body: {
        agentId: session.agent_id,
        sessionId: session.id,
        userId: user.id,
        input: values
      }
    });

    if (error) {
      console.error(error);
      setStatus('Submission failed. Please try again.');
    } else {
      setStatus('Form submitted to agent successfully.');
    }
  };

  if (config.fields.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-surface/40 p-8 text-center text-sm text-text-muted">
        Configure form fields in Supabase to render this agent.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-border bg-surface/60 p-8 shadow-sm"
    >
      {config.fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label htmlFor={field.name} className="block text-sm font-medium text-text">
            {field.label}
            {field.required && <span className="ml-1 text-accent">*</span>}
          </label>
          {renderField(field, values[field.name] ?? '', handleChange)}
        </div>
      ))}
      <button
        type="submit"
        className="rounded-xl bg-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
      >
        {config.submitLabel ?? 'Submit to agent'}
      </button>
      {status && <p className="text-sm text-text-muted">{status}</p>}
    </form>
  );
}

function renderField(
  field: FieldConfig,
  value: string,
  onChange: (name: string, value: string) => void
) {
  const common =
    'w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          id={field.name}
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          className={`${common} min-h-[120px]`}
          required={field.required}
        />
      );
    case 'number':
      return (
        <input
          id={field.name}
          type="number"
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          className={common}
          required={field.required}
        />
      );
    case 'select':
      return (
        <select
          id={field.name}
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={common}
          required={field.required}
        >
          <option value="" disabled>
            {field.placeholder ?? 'Select an option'}
          </option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case 'date':
      return (
        <input
          id={field.name}
          type="date"
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={common}
          required={field.required}
        />
      );
    case 'text':
    default:
      return (
        <input
          id={field.name}
          type="text"
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          className={common}
          required={field.required}
        />
      );
  }
}
