-- Add the Text Analyzer agent to your Supabase database
-- Run this in your Supabase SQL Editor

INSERT INTO public.agents (
  id,
  name,
  description,
  type,
  icon,
  config_json,
  created_at
) VALUES (
  gen_random_uuid(),
  'Text Analyzer',
  'AI-powered text analysis with sentiment detection, word counting, and key insights generation',
  'custom',
  '📝',
  '{"component": "text-analyzer"}',
  now()
);

-- Verify the agent was added
SELECT * FROM public.agents WHERE name = 'Text Analyzer';
