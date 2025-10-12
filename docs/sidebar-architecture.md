# Sidebar Architecture Documentation

## Overview

The sidebar component provides a comprehensive navigation and session management interface for the AI Launchpad application. It integrates with our provider architecture to deliver a seamless user experience for managing agent sessions, user profiles, and navigation.

## Component Structure

```
Sidebar
├── Header (Logo + Collapse Toggle)
├── Navigation (Home)
├── Current Session (Active session info)
├── Available Agents (Start new sessions)
├── Recent Sessions (Switch between sessions)
├── Loading States
└── User Section (Profile + Settings + Logout)
```

## Key Features

### 1. **Logout Functionality**

**Location**: Bottom of sidebar, in User Section
**Component**: `LogoutButton` (reused from existing auth components)
**Integration**: 
- Uses `useSupabaseClient()` to call `supabase.auth.signOut()`
- Automatically redirects to `/login` after logout
- Maintains existing authentication flow

```typescript
// Integrated via existing LogoutButton component
<LogoutButton />
```

### 2. **User Profile Access & Editing**

**Location**: User Section, Settings button
**Component**: `UserSettingsModal` (reused from existing auth components)
**Integration**:
- Opens modal when Settings button is clicked
- Uses `useUserProfile()` hook to access and update profile data
- Displays user email, display name, and preferences
- Saves changes to `user_profiles` table via Supabase

```typescript
const { displayName, user, updateProfile } = useUserProfile();

// Settings button opens modal
<button onClick={() => setShowSettings(true)}>
  <Settings /> Settings
</button>

// Modal handles profile updates
<UserSettingsModal 
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
  userEmail={user?.email || 'guest@example.com'}
/>
```

### 3. **Active Agent Session Management**

**Location**: "Current Session" section
**Integration**: 
- Uses `useSession()` hook to access active session data
- Displays current agent name, session title, and activity status
- Shows agent icon and type-specific indicators
- Updates in real-time when sessions change

```typescript
const { activeSessionId, activeAgentId, activeSession } = useSession();

// Displays current session info
{activeSessionId && (
  <div className="current-session">
    <AgentIcon />
    <AgentName />
    <SessionTitle />
    <ActivityStatus />
  </div>
)}
```

### 4. **Session Switching**

**Location**: "Recent Sessions" section
**Integration**:
- Lists user's recent sessions ordered by `last_active_at`
- Each session shows agent name, creation date, and status
- Active session is highlighted with accent colors
- Clicking a session calls `switchSession(sessionId)`

```typescript
const { userSessions, switchSession } = useSession();

// Session switching functionality
const handleSwitchSession = async (sessionId: string) => {
  await switchSession(sessionId);
  // Session state automatically updates via providers
};
```

### 5. **New Session Creation**

**Location**: "Start New Session" section
**Integration**:
- Lists available agents from `agents` table
- Shows agent name, description, and type-specific icons
- Clicking an agent calls `createSession(agentId)`
- New session becomes active immediately

```typescript
const { createSession } = useSession();

// Create new session
const handleCreateSession = async (agentId: string) => {
  const newSession = await createSession(agentId);
  // New session becomes active automatically
};
```

### 6. **Homepage Navigation**

**Location**: Navigation section, "Home" link
**Integration**:
- Links to "/" (dashboard)
- Shows homepage with available agents when no active session
- Shows session manager when there's an active session
- Uses Next.js `Link` component for client-side navigation

```typescript
<Link href="/" className={pathname === '/' ? 'active' : ''}>
  <Home /> Home
</Link>
```

## Provider Integration

### UserProfileProvider Integration

```typescript
const { 
  user,           // Current user object
  displayName,    // User's display name (from profile or email)
  loading,        // Loading state
  updateProfile   // Function to update profile
} = useUserProfile();
```

**Used for**:
- Displaying user email and display name in user section
- Opening user settings modal
- Updating profile information

### SessionProvider Integration

```typescript
const {
  activeSessionId,    // Currently active session ID
  activeAgentId,      // Currently active agent ID
  activeSession,      // Full active session object
  userSessions,       // Array of user's sessions
  loading,           // Loading state
  createSession,     // Create new session
  switchSession,     // Switch to different session
  updateSessionState, // Update session state
  deleteSession      // Delete session
} = useSession();
```

**Used for**:
- Managing active session display
- Creating new sessions from agent list
- Switching between existing sessions
- Session state management

### AgentStateProvider Integration

```typescript
const {
  agentState,     // Current agent state
  updateState,    // Update state values
  saveState,      // Save state to database
  getStateValue   // Get specific state value
} = useAgentState();
```

**Used for**:
- Persisting session state when switching sessions
- Auto-saving agent interactions
- Restoring state when returning to sessions

## UI/UX Features

### Responsive Design

- **Collapsible**: Toggle between expanded (320px) and collapsed (80px) states
- **Mobile-friendly**: Adapts to smaller screens
- **Smooth transitions**: CSS transitions for state changes

### Visual Hierarchy

- **Sections**: Clear separation between navigation, sessions, and user actions
- **Icons**: Consistent iconography using Lucide React
- **Colors**: Uses design system colors (accent, muted, text, etc.)
- **Typography**: Proper font weights and sizes for readability

### Loading States

- **Skeleton loading**: Shows loading placeholders while data loads
- **Progressive loading**: Different sections load independently
- **Error handling**: Graceful fallbacks for failed requests

### Interactive Elements

- **Hover states**: Visual feedback on interactive elements
- **Active states**: Clear indication of current page/session
- **Disabled states**: Proper handling of unavailable actions

## State Management Flow

### 1. Initial Load

```
1. Sidebar mounts
2. UserProfileProvider loads user data
3. SessionProvider loads user sessions
4. Active session is determined (most recent or none)
5. UI renders with loaded data
```

### 2. Session Creation

```
1. User clicks agent in "Start New Session"
2. handleCreateSession() called
3. createSession() creates new session in database
4. SessionProvider updates state
5. New session becomes active
6. UI updates to show new active session
7. Main content switches to SessionManager
```

### 3. Session Switching

```
1. User clicks session in "Recent Sessions"
2. handleSwitchSession() called
3. switchSession() updates database
4. SessionProvider updates active session
5. AgentStateProvider loads session state
6. UI updates to show new active session
7. Main content updates with new session data
```

### 4. Profile Updates

```
1. User clicks Settings button
2. UserSettingsModal opens
3. User makes changes and saves
4. updateProfile() updates database
5. UserProfileProvider refreshes data
6. Sidebar UI updates with new profile info
```

## Integration with Main App

### AppShell Integration

```typescript
// Protected layout provides agents to sidebar
<AppShell agents={agents}>
  <Sidebar agents={agents} />
  <main>{children}</main>
</AppShell>
```

### Dashboard Integration

```typescript
// Dashboard shows different content based on active session
{activeSession ? (
  <SessionManager />  // Show session interface
) : (
  <AgentGrid />       // Show agent selection
)}
```

## Performance Optimizations

### Data Loading

- **Server-side**: Agents loaded in protected layout (server component)
- **Client-side**: Sessions and profile loaded by providers
- **Caching**: Provider state cached to avoid re-fetching
- **Real-time**: Supabase real-time subscriptions for live updates

### UI Optimizations

- **Virtual scrolling**: For large session lists (future enhancement)
- **Lazy loading**: Load session details only when needed
- **Memoization**: Prevent unnecessary re-renders
- **Debounced updates**: Batch rapid state changes

## Security Considerations

### Data Access

- **RLS Policies**: All database queries respect Row Level Security
- **User Isolation**: Users only see their own sessions and data
- **Session Validation**: Active sessions validated on each interaction

### Authentication

- **Session Persistence**: Uses Supabase auth session management
- **Automatic Logout**: Handles expired sessions gracefully
- **Protected Routes**: Middleware ensures authentication

## Future Enhancements

### Planned Features

1. **Session Sharing**: Allow collaborative sessions
2. **Session Templates**: Save and reuse session configurations
3. **Advanced Filtering**: Filter sessions by agent type, date, etc.
4. **Bulk Operations**: Delete multiple sessions, export data
5. **Real-time Collaboration**: Live updates when multiple users in same session
6. **Session Analytics**: Usage statistics and insights
7. **Custom Shortcuts**: Keyboard shortcuts for common actions

### Technical Improvements

1. **Offline Support**: Cache sessions for offline access
2. **Progressive Web App**: Install as desktop/mobile app
3. **Advanced Search**: Full-text search across sessions
4. **Drag & Drop**: Reorder sessions, organize by projects
5. **Themes**: Multiple UI themes and customization options

## Testing Strategy

### Unit Tests

- Test individual provider hooks
- Test sidebar component rendering
- Test user interactions (clicks, form submissions)

### Integration Tests

- Test provider integration
- Test database operations
- Test session management flow

### E2E Tests

- Test complete user journeys
- Test session persistence across page refreshes
- Test error handling scenarios

## Conclusion

The sidebar component provides a comprehensive and intuitive interface for managing AI agent sessions while maintaining clean separation of concerns through the provider architecture. It successfully integrates all required functionality while being extensible for future enhancements.
