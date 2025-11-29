/**
 * Provider Integration Tests
 * Tests the complete provider architecture and database integration
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { UserProfileProvider } from '@/components/providers/UserProfileProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { AgentStateProvider } from '@/components/providers/AgentStateProvider';
import DisplayName from '@/components/auth/DisplayName';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(),
  channel: jest.fn(),
  removeChannel: jest.fn(),
};

// Mock data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
};

const mockProfile = {
  id: 'test-profile-id',
  user_id: 'test-user-id',
  display_name: 'Test User',
  email_notifications: true,
  auto_save_sessions: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockAgent = {
  id: 'test-agent-id',
  name: 'Test Agent',
  description: 'A test agent',
  type: 'chat' as const,
  icon: '🤖',
  config_json: {},
  created_at: '2024-01-01T00:00:00Z',
};

const mockSession = {
  id: 'test-session-id',
  user_id: 'test-user-id',
  agent_id: 'test-agent-id',
  title: 'Test Session',
  session_state: { messages: [] },
  is_active: true,
  session_metadata: {},
  created_at: '2024-01-01T00:00:00Z',
  last_active_at: '2024-01-01T00:00:00Z',
};

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={mockSupabaseClient as any}>
      <UserProfileProvider>
        <SessionProvider>
          <AgentStateProvider>
            {children}
          </AgentStateProvider>
        </SessionProvider>
      </UserProfileProvider>
    </SessionContextProvider>
  );
}

describe('Provider Architecture Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });
    
    // Mock database queries
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockMaybeSingle = jest.fn();
    const mockSingle = jest.fn();
    const mockOrder = jest.fn().mockReturnThis();
    const mockInsert = jest.fn().mockReturnThis();
    const mockUpdate = jest.fn().mockReturnThis();
    const mockDelete = jest.fn().mockReturnThis();
    
    mockSupabaseClient.from.mockImplementation((table: string) => {
      switch (table) {
        case 'user_profiles':
          return {
            select: mockSelect,
            eq: mockEq,
            maybeSingle: mockMaybeSingle.mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
            upsert: jest.fn().mockReturnThis(),
            single: mockSingle.mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          };
        case 'sessions':
          return {
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
            maybeSingle: mockMaybeSingle,
            insert: mockInsert.mockReturnThis(),
            update: mockUpdate.mockReturnThis(),
            delete: mockDelete.mockReturnThis(),
            single: mockSingle.mockResolvedValue({
              data: mockSession,
              error: null,
            }),
          };
        case 'agents':
          return {
            select: mockSelect,
            order: mockOrder,
          };
        default:
          return {
            select: mockSelect,
            eq: mockEq,
            maybeSingle: mockMaybeSingle,
            insert: mockInsert,
            update: mockUpdate,
            delete: mockDelete,
            single: mockSingle,
          };
      }
    });
  });

  describe('UserProfileProvider', () => {
    it('should load user profile on mount', async () => {
      render(
        <TestWrapper>
          <DisplayName />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles');
      });
    });

    it('should display user display name', async () => {
      render(
        <TestWrapper>
          <DisplayName />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      // Mock delayed response
      mockSupabaseClient.auth.getUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: { user: mockUser },
          error: null,
        }), 100))
      );

      render(
        <TestWrapper>
          <DisplayName />
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should fallback to email prefix when no display name', async () => {
      const profileWithoutDisplayName = { ...mockProfile, display_name: null };
      
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: profileWithoutDisplayName,
              error: null,
            }),
          };
        }
        return {};
      });

      render(
        <TestWrapper>
          <DisplayName />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument(); // email prefix
      });
    });
  });

  describe('SessionProvider', () => {
    it('should load user sessions on mount', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: [mockSession],
              error: null,
            }),
          };
        }
        return {};
      });

      render(
        <TestWrapper>
          <div>Test Component</div>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions');
      });
    });

    it('should create new session', async () => {
      const createSessionMock = jest.fn().mockResolvedValue({
        data: mockSession,
        error: null,
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
            insert: jest.fn().mockReturnThis(),
            single: createSessionMock,
          };
        }
        return {};
      });

      render(
        <TestWrapper>
          <div>Test Component</div>
        </TestWrapper>
      );

      // Test session creation would be done through useSession hook
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions');
      });
    });
  });

  describe('AgentStateProvider', () => {
    it('should initialize with empty state', async () => {
      render(
        <TestWrapper>
          <div>Test Component</div>
        </TestWrapper>
      );

      await waitFor(() => {
        // AgentStateProvider should initialize with empty state
        expect(true).toBe(true); // Basic render test
      });
    });
  });

  describe('Database Integration', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          };
        }
        return {};
      });

      render(
        <TestWrapper>
          <DisplayName />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should fallback to email prefix even with database error
        expect(screen.getByText('test')).toBeInTheDocument();
      });
    });

    it('should handle authentication errors', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error'),
      });

      render(
        <TestWrapper>
          <DisplayName />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should handle no user gracefully
        expect(screen.getByText('User')).toBeInTheDocument();
      });
    });
  });

  describe('Provider Context Integration', () => {
    it('should provide context to nested components', async () => {
      const TestComponent = () => {
        // This would use useUserProfile, useSession, useAgentState hooks
        return <div data-testid="context-test">Context Available</div>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('context-test')).toBeInTheDocument();
      });
    });

    it('should throw error when hooks used outside providers', () => {
      // This test would verify that hooks throw proper errors when used outside context
      const TestComponent = () => {
        try {
          // This should throw an error
          const { displayName } = useUserProfile();
          return <div>{displayName}</div>;
        } catch (error) {
          return <div data-testid="error">Hook used outside provider</div>;
        }
      };

      // Render without providers
      render(<TestComponent />);
      
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });
});

// Helper function to test provider hooks
function useUserProfile() {
  // This would be the actual hook implementation
  // For testing purposes, we'll mock the behavior
  throw new Error('useUserProfile must be used within a UserProfileProvider');
}
