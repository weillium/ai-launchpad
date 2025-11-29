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
          is_active: boolean | null;
          session_metadata: Json | null;
          created_at: string;
          last_active_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          title?: string | null;
          session_state?: Json | null;
          is_active?: boolean | null;
          session_metadata?: Json | null;
          created_at?: string;
          last_active_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
        Relationships: [
          {
            foreignKeyName: "fk_sessions_agent_id";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_sessions_user_id";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "fk_agent_runs_session_id";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_agent_runs_agent_id";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_agent_runs_user_id";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          email_notifications: boolean | null;
          auto_save_sessions: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          email_notifications?: boolean | null;
          auto_save_sessions?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
        Relationships: [
          {
            foreignKeyName: "fk_user_profiles_user_id";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type AgentType = Database['public']['Tables']['agents']['Row']['type'];
