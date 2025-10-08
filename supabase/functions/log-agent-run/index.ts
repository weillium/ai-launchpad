import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

interface AgentRunPayload {
  agentId: string;
  sessionId: string;
  userId: string;
  input: unknown;
  history?: unknown;
}

async function callOpenAI(input: AgentRunPayload['input'], history: unknown) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an assistant embedded in AI Launchpad.' },
        ...(Array.isArray(history) ? history : []),
        { role: 'user', content: typeof input === 'string' ? input : JSON.stringify(input) }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI API error: ${detail}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0]?.message?.content ?? 'No response provided.';
  const tokens = data.usage?.total_tokens ?? 0;
  const cost = tokens * 0.000002;

  return {
    response: choice,
    tokens,
    cost
  };
}

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as AgentRunPayload;

    const openaiResult = await callOpenAI(payload.input, payload.history);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.38.4');
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('agent_runs').insert({
      agent_id: payload.agentId,
      session_id: payload.sessionId,
      user_id: payload.userId,
      input_json: payload.input,
      output_json: { response: openaiResult.response },
      tokens_used: openaiResult.tokens,
      cost_estimate: openaiResult.cost
    });

    return new Response(JSON.stringify(openaiResult), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
