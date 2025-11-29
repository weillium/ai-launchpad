-- Database Schema Validation Tests
-- Run these tests against your Supabase instance to verify the schema

-- Test 1: Verify foreign key constraints exist
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('sessions', 'agent_runs', 'user_profiles')
ORDER BY tc.table_name, tc.constraint_name;

-- Expected: Should show foreign key constraints for all tables

-- Test 2: Verify indexes exist
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('sessions', 'agent_runs', 'user_profiles', 'agents')
ORDER BY tablename, indexname;

-- Expected: Should show performance indexes

-- Test 3: Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('agents', 'sessions', 'agent_runs', 'user_profiles')
ORDER BY tablename;

-- Expected: rowsecurity should be 't' (true) for all tables

-- Test 4: Verify RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('agents', 'sessions', 'agent_runs', 'user_profiles')
ORDER BY tablename, policyname;

-- Expected: Should show RLS policies for all tables

-- Test 5: Verify triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('sessions', 'user_profiles')
ORDER BY event_object_table, trigger_name;

-- Expected: Should show update triggers

-- Test 6: Verify functions exist
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_updated_at_column', 'validate_session_state', 'update_session_activity')
ORDER BY routine_name;

-- Expected: Should show custom functions

-- Test 7: Verify new columns exist
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sessions'
  AND column_name IN ('is_active', 'session_metadata')
ORDER BY column_name;

-- Expected: Should show new session columns

-- Test 8: Verify real-time publication
SELECT 
  pubname,
  puballtables,
  pubinsert,
  pubupdate,
  pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- Expected: Should show real-time publication

-- Test 9: Verify real-time tables
SELECT 
  pubname,
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('sessions', 'agent_runs')
ORDER BY tablename;

-- Expected: Should show sessions and agent_runs tables

-- Test 10: Test data integrity with sample data
-- Create test data (run in a transaction that gets rolled back)
BEGIN;

-- Insert test agent
INSERT INTO agents (id, name, description, type, icon, config_json)
VALUES ('test-agent-1', 'Test Agent', 'A test agent', 'chat', '🤖', '{}');

-- Insert test user profile
INSERT INTO user_profiles (id, user_id, display_name, email_notifications, auto_save_sessions)
VALUES ('test-profile-1', '00000000-0000-0000-0000-000000000000', 'Test User', true, true);

-- Insert test session
INSERT INTO sessions (id, user_id, agent_id, title, session_state, is_active, session_metadata)
VALUES ('test-session-1', '00000000-0000-0000-0000-000000000000', 'test-agent-1', 'Test Session', '{"messages": []}', true, '{}');

-- Insert test agent run
INSERT INTO agent_runs (id, session_id, agent_id, user_id, input_json, output_json, tokens_used, cost_estimate)
VALUES ('test-run-1', 'test-session-1', 'test-agent-1', '00000000-0000-0000-0000-000000000000', '{"input": "test"}', '{"output": "response"}', 100, 0.0002);

-- Verify data integrity
SELECT 
  'agents' as table_name,
  COUNT(*) as count
FROM agents
WHERE id = 'test-agent-1'

UNION ALL

SELECT 
  'sessions' as table_name,
  COUNT(*) as count
FROM sessions
WHERE id = 'test-session-1'

UNION ALL

SELECT 
  'agent_runs' as table_name,
  COUNT(*) as count
FROM agent_runs
WHERE id = 'test-run-1'

UNION ALL

SELECT 
  'user_profiles' as table_name,
  COUNT(*) as count
FROM user_profiles
WHERE id = 'test-profile-1';

-- Expected: All should return count = 1

-- Test foreign key constraint by trying to delete referenced data
-- This should fail due to foreign key constraints
DELETE FROM agents WHERE id = 'test-agent-1';
-- Expected: Should fail with foreign key constraint error

-- Clean up test data
ROLLBACK;

-- Test 11: Performance test for common queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT s.*, a.name as agent_name
FROM sessions s
JOIN agents a ON s.agent_id = a.id
WHERE s.user_id = '00000000-0000-0000-0000-000000000000'
ORDER BY s.last_active_at DESC
LIMIT 10;

-- Expected: Should use indexes and be fast

-- Test 12: RLS policy test (requires authenticated user context)
-- Note: This test requires being logged in as a user
-- SELECT COUNT(*) FROM sessions WHERE user_id = auth.uid();
-- Expected: Should only return user's own sessions

-- Test 13: Verify JSON validation
INSERT INTO sessions (id, user_id, agent_id, title, session_state)
VALUES ('test-invalid-json', '00000000-0000-0000-0000-000000000000', 'test-agent-1', 'Test', 'invalid json');
-- Expected: Should fail due to JSON validation trigger

-- Summary: All tests should pass for a properly configured database
