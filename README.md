# AI Launchpad

Scaffolded Next.js + Supabase workspace for modular AI agent mini-apps with Tailwind CSS styling and Supabase-backed persistence.

## Features

- **Hybrid agent architecture** combining config-driven agents stored in Supabase with plug-and-play custom React components.
- **Supabase Auth** protected routes with session persistence and sidebar session switcher.
- **Agent-specific UIs** for chat, form, workflow, and custom agent types.
- **Edge Function example** for calling OpenAI securely and logging agent runs.
- **AWS Amplify ready** – configure build commands to deploy the Next.js app.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm, npm, or yarn
- Supabase project with the SQL schema from [`supabase/migrations/20240101000000_initial_schema.sql`](supabase/migrations/20240101000000_initial_schema.sql)

### Installation

```bash
pnpm install
# or
npm install
```

Copy the `.env.example` into `.env.local` and populate with your Supabase project keys and OpenAI API key.

```bash
cp .env.example .env.local
```

Required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Supabase Setup

1. Run the SQL migration in your Supabase SQL Editor to create the `agents`, `sessions`, and `agent_runs` tables plus policies.
2. Deploy the edge function:

   ```bash
   supabase functions deploy log-agent-run --no-verify-jwt
   supabase secrets set OPENAI_API_KEY=your-openai-key SUPABASE_SERVICE_ROLE_KEY=your-service-role-key SUPABASE_URL=https://your-project.supabase.co
   ```

3. Configure Supabase Auth providers (e.g., GitHub, Google) as needed.

### Local Development

```bash
pnpm dev
```

The dev server runs at `http://localhost:3000`.

### AWS Amplify Deployment

1. Push the repository to your Git provider.
2. Create a new Amplify app connected to the repo.
3. Set environment variables in Amplify for the Supabase keys and `OPENAI_API_KEY` (for edge function invocation from serverless logic only).
4. Use the build command:

   ```bash
   npm ci
   npm run build
   npm run start -- --hostname 0.0.0.0 --port 3000
   ```

   (Adjust for pnpm/yarn as needed.)

### Project Structure

```
app/                     # Next.js App Router pages
  (auth)/login           # Auth screen
  (protected)/           # Authenticated dashboard + sessions
  auth/callback          # Supabase auth callback handler
agents/                  # Custom React mini-apps
components/              # Reusable UI components
hooks/                   # Client hooks for agents and sessions
lib/                     # Supabase types and helpers
supabase/functions/      # Edge function example
supabase/migrations/     # Database schema
```

### Creating Agents

- **Config-driven agent**: Insert into `agents` table with `type` of `chat`, `form`, or `workflow` and supply `config_json` as needed (e.g., form field definitions).
- **Custom agent**: Create a React component in `agents/` (e.g., `WeatherVisualizer.tsx`) and reference it from Supabase by storing `{ "component": "weather-visualizer" }` in `config_json` with `type = 'custom'`.

### Session Persistence

Sessions are persisted in the `sessions` table. Switching between sessions via the sidebar restores stored state (e.g., chat history, form values) thanks to `session_state` JSON columns.

### Edge Function Logging

All interactions should be proxied through Supabase Edge Functions (see `supabase/functions/log-agent-run/index.ts`) to prevent exposing API keys and to log token usage and cost estimates in `agent_runs`.

### Future Enhancements

- Add a meta-agent that orchestrates other agents via Supabase RPC.
- Integrate drag-and-drop canvas for workflow agents (e.g., React Flow).
- Build analytics dashboards for cost and usage insights.

## License

MIT
