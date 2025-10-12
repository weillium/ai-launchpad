-- Phase 1 Database Enhancements
-- Essential changes for proper state management and security

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add foreign key constraints for data integrity
ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_agent_id 
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

ALTER TABLE agent_runs 
ADD CONSTRAINT fk_agent_runs_session_id 
FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE agent_runs 
ADD CONSTRAINT fk_agent_runs_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE agent_runs 
ADD CONSTRAINT fk_agent_runs_agent_id 
FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE;

ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add session metadata columns
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_metadata JSONB DEFAULT '{}';

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sessions(user_id, is_active, last_active_at);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON sessions(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_session_id ON agent_runs(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Agents policies (public read, admin write)
CREATE POLICY "Anyone can view active agents" ON agents
FOR SELECT USING (true);

CREATE POLICY "Service role can manage agents" ON agents
FOR ALL USING (auth.role() = 'service_role');

-- Sessions policies (user-specific)
CREATE POLICY "Users can view own sessions" ON sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON sessions
FOR DELETE USING (auth.uid() = user_id);

-- Agent runs policies (user-specific)
CREATE POLICY "Users can view own agent runs" ON agent_runs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent runs" ON agent_runs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage agent runs" ON agent_runs
FOR ALL USING (auth.role() = 'service_role');

-- User profiles policies (user-specific)
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
FOR DELETE USING (auth.uid() = user_id);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Session state validation function
CREATE OR REPLACE FUNCTION validate_session_state()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic validation: session_state should be valid JSON
  IF NEW.session_state IS NOT NULL THEN
    -- This will throw an error if session_state is not valid JSON
    PERFORM jsonb_typeof(NEW.session_state);
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add validation trigger to sessions
CREATE TRIGGER validate_sessions_state 
  BEFORE INSERT OR UPDATE ON sessions 
  FOR EACH ROW EXECUTE FUNCTION validate_session_state();

-- Enable real-time subscriptions for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_runs;

-- Create a function to automatically update last_active_at on session state changes
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_active_at when session_state changes
  IF OLD.session_state IS DISTINCT FROM NEW.session_state THEN
    NEW.last_active_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update last_active_at
CREATE TRIGGER update_session_activity_trigger
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_session_activity();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id_agent_id ON sessions(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE agents IS 'AI agent definitions and configurations';
COMMENT ON TABLE sessions IS 'User sessions with persistent state for each agent interaction';
COMMENT ON TABLE agent_runs IS 'Individual agent execution logs and results';
COMMENT ON TABLE user_profiles IS 'User preferences and profile information';

COMMENT ON COLUMN sessions.session_state IS 'JSON state data specific to the agent type';
COMMENT ON COLUMN sessions.is_active IS 'Whether the session is currently active';
COMMENT ON COLUMN sessions.session_metadata IS 'Additional metadata about the session';
COMMENT ON COLUMN agent_runs.input_json IS 'Input data sent to the agent';
COMMENT ON COLUMN agent_runs.output_json IS 'Output data returned by the agent';
COMMENT ON COLUMN agent_runs.tokens_used IS 'Number of tokens consumed (for AI agents)';
COMMENT ON COLUMN agent_runs.cost_estimate IS 'Estimated cost in USD (for AI agents)';
