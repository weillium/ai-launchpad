# Integration Test Guide

This guide explains how to test the complete provider architecture and database integration.

## Prerequisites

1. **Supabase Project**: Set up a Supabase project with the Phase 1 migration applied
2. **Environment Variables**: Configure all required environment variables
3. **Test Data**: Have some sample agents and user data in the database

## Test Execution Order

### 1. Database Schema Validation

Run the SQL tests in `tests/database-schema.test.sql` against your Supabase instance:

```bash
# Connect to your Supabase database and run the tests
psql -h your-supabase-host -U postgres -d postgres -f tests/database-schema.test.sql
```

**Expected Results:**
- ✅ All foreign key constraints exist
- ✅ All indexes are created
- ✅ RLS is enabled on all tables
- ✅ RLS policies are configured
- ✅ Triggers and functions exist
- ✅ New columns are present
- ✅ Real-time subscriptions are configured

### 2. Frontend Provider Tests

Run the React component tests:

```bash
# Install test dependencies if not already installed
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom

# Run the provider integration tests
npm test tests/provider-integration.test.tsx
```

**Expected Results:**
- ✅ UserProfileProvider loads user data correctly
- ✅ SessionProvider manages sessions properly
- ✅ AgentStateProvider handles state updates
- ✅ All providers integrate correctly
- ✅ Error handling works as expected

### 3. End-to-End Integration Test

#### Test Scenario: Complete User Journey

1. **User Login**
   - Navigate to `/login`
   - Authenticate with Supabase Auth
   - Should redirect to dashboard

2. **Dashboard Load**
   - Should display user's display name
   - Should load available agents
   - Should show user's sessions (if any)

3. **Create New Session**
   - Click on an agent card
   - Should create a new session
   - Should load agent-specific UI

4. **Agent State Management**
   - Interact with the agent (send message, fill form, etc.)
   - State should be saved to database
   - Refresh page and verify state persists

5. **Session Switching**
   - Create multiple sessions with different agents
   - Switch between sessions
   - Verify each session maintains its state

6. **User Profile Management**
   - Update display name in settings
   - Verify changes persist across page refreshes
   - Verify changes are reflected in UI immediately

#### Manual Test Checklist

- [ ] User can log in successfully
- [ ] Dashboard loads with user's display name
- [ ] Agent cards are displayed correctly
- [ ] New sessions can be created
- [ ] Agent state is saved and restored
- [ ] Session switching works correctly
- [ ] User profile updates work
- [ ] Page refreshes maintain state
- [ ] Real-time updates work (if implemented)
- [ ] Error handling works gracefully

### 4. Performance Tests

#### Database Performance

```sql
-- Test session loading performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT s.*, a.name as agent_name
FROM sessions s
JOIN agents a ON s.agent_id = a.id
WHERE s.user_id = 'your-user-id'
ORDER BY s.last_active_at DESC
LIMIT 10;
```

**Expected:** Query should use indexes and complete quickly (< 50ms)

#### Frontend Performance

- Use browser dev tools to measure:
  - Initial page load time
  - Provider initialization time
  - State update response time
  - Memory usage during session switching

### 5. Security Tests

#### RLS Policy Testing

```sql
-- Test 1: Verify users can only see their own data
-- Run as different users and verify data isolation

-- Test 2: Verify service role can access all data
-- Test admin operations work correctly

-- Test 3: Verify anonymous users are blocked
-- Try to access protected data without authentication
```

#### Data Validation

- Test invalid JSON in session_state
- Test SQL injection attempts
- Test unauthorized access attempts

### 6. Error Handling Tests

#### Network Failures
- Disconnect internet during state save
- Verify graceful error handling
- Verify retry mechanisms

#### Database Errors
- Simulate database connection issues
- Test with malformed data
- Verify error boundaries work

#### Authentication Errors
- Test expired sessions
- Test invalid tokens
- Test logout scenarios

## Test Data Setup

### Required Test Data

```sql
-- Insert test agents
INSERT INTO agents (id, name, description, type, icon, config_json) VALUES
('chat-agent-1', 'Chat Assistant', 'A helpful chat bot', 'chat', '💬', '{"system_prompt": "You are a helpful assistant"}'),
('form-agent-1', 'Data Collector', 'Collects user information', 'form', '📝', '{"fields": [{"name": "email", "type": "email"}]}'),
('workflow-agent-1', 'Process Manager', 'Manages workflows', 'workflow', '⚙️', '{"steps": ["start", "process", "end"]}');

-- Create test user profile
INSERT INTO user_profiles (user_id, display_name, email_notifications, auto_save_sessions) VALUES
('your-user-id', 'Test User', true, true);
```

## Troubleshooting

### Common Issues

1. **Provider Context Errors**
   - Ensure all providers are wrapped correctly in layout
   - Check that hooks are used within provider context

2. **Database Connection Issues**
   - Verify environment variables are correct
   - Check Supabase project is accessible
   - Verify RLS policies allow access

3. **State Not Persisting**
   - Check session_state column type (should be JSONB)
   - Verify updateSessionState function works
   - Check for JavaScript errors in console

4. **Performance Issues**
   - Verify indexes are created
   - Check for N+1 query problems
   - Monitor database query performance

### Debug Tools

1. **Browser Dev Tools**
   - Network tab for API calls
   - Console for JavaScript errors
   - Application tab for localStorage/sessionStorage

2. **Supabase Dashboard**
   - Database logs for query performance
   - Auth logs for authentication issues
   - Real-time logs for subscription issues

3. **React Dev Tools**
   - Provider context values
   - Component state changes
   - Hook dependencies

## Success Criteria

The integration is successful when:

1. ✅ All database schema tests pass
2. ✅ All provider tests pass
3. ✅ Complete user journey works end-to-end
4. ✅ State persists across page refreshes
5. ✅ Performance meets requirements (< 100ms for state updates)
6. ✅ Security policies prevent unauthorized access
7. ✅ Error handling is graceful and informative
8. ✅ Real-time features work (if implemented)

## Next Steps

After successful integration testing:

1. **Add Real-time Features**: Implement live session updates
2. **Add Offline Support**: Handle network disconnections
3. **Add Session Sharing**: Allow collaborative sessions
4. **Add Analytics**: Track usage patterns
5. **Add Advanced Features**: Custom agent types, workflows, etc.
