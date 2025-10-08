export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: 'chat' | 'form' | 'workflow' | 'custom';
          icon: string | null;
          config_json: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: 'chat' | 'form' | 'workflow' | 'custom';
          icon?: string | null;
          config_json?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['agents']['Insert']>;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          title: string | null;
          session_state: Json | null;
          created_at: string;
          last_active_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          title?: string | null;
          session_state?: Json | null;
          created_at?: string;
          last_active_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
        Relationships: [];
      };
      agent_runs: {
        Row: {
          id: string;
          session_id: string;
          agent_id: string;
          user_id: string;
          input_json: Json | null;
          output_json: Json | null;
          tokens_used: number | null;
          cost_estimate: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          agent_id: string;
          user_id: string;
          input_json?: Json | null;
          output_json?: Json | null;
          tokens_used?: number | null;
          cost_estimate?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['agent_runs']['Insert']>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export type AgentType = Database['public']['Tables']['agents']['Row']['type'];
