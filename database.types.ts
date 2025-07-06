export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at?: string
          username: string
          full_name: string
          avatar_url?: string
          website?: string
        }
        Insert: {
          id: string
          updated_at?: string
          username: string
          full_name: string
          avatar_url?: string
          website?: string
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string
          website?: string
        }
      }
      sdlc_projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description?: string
          input_text: string
          status: string
          template_used?: string
          jira_project?: string
          confluence_space?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          input_text: string
          status?: string
          template_used?: string
          jira_project?: string
          confluence_space?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          input_text?: string
          status?: string
          template_used?: string
          jira_project?: string
          confluence_space?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          project_id: string
          document_type: string
          content: string
          version: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          document_type: string
          content: string
          version?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          document_type?: string
          content?: string
          version?: number
          created_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          project_id: string
          integration_type: string
          external_id: string
          external_url?: string
          metadata?: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          integration_type: string
          external_id: string
          external_url?: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          integration_type?: string
          external_id?: string
          external_url?: string
          metadata?: Json
          created_at?: string
        }
      }
      user_configurations: {
        Row: {
          id: string
          user_id: string
          openai_api_key?: string
          jira_base_url?: string
          jira_email?: string
          jira_api_token?: string
          confluence_base_url?: string
          confluence_email?: string
          confluence_api_token?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          openai_api_key?: string
          jira_base_url?: string
          jira_email?: string
          jira_api_token?: string
          confluence_base_url?: string
          confluence_email?: string
          confluence_api_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          openai_api_key?: string
          jira_base_url?: string
          jira_email?: string
          jira_api_token?: string
          confluence_base_url?: string
          confluence_email?: string
          confluence_api_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      progress_logs: {
        Row: {
          id: string
          project_id: string
          step: string
          status: string
          message?: string
          progress_percentage: number
          timestamp: string
        }
        Insert: {
          id?: string
          project_id: string
          step: string
          status: string
          message?: string
          progress_percentage?: number
          timestamp?: string
        }
        Update: {
          id?: string
          project_id?: string
          step?: string
          status?: string
          message?: string
          progress_percentage?: number
          timestamp?: string
        }
      }
      templates: {
        Row: {
          id: string
          user_id?: string
          name: string
          description?: string
          category: string
          configuration: Json
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          description?: string
          category: string
          configuration: Json
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          category?: string
          configuration?: Json
          is_public?: boolean
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id?: string
          action: string
          resource_type?: string
          resource_id?: string
          metadata?: Json
          ip_address?: string
          user_agent?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          action: string
          resource_type?: string
          resource_id?: string
          metadata?: Json
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string
          resource_id?: string
          metadata?: Json
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
