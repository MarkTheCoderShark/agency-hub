// Database types - following Supabase generated types format
// Includes Relationships arrays required for proper type inference in Supabase v2+

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'owner' | 'staff'
export type ProjectMemberRole = 'lead' | 'staff' | 'client'
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived'
export type RequestType = 'bug' | 'change' | 'feature' | 'question'
export type RequestPriority = 'normal' | 'urgent'
export type RequestStatus = 'submitted' | 'in_progress' | 'complete'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'
export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'scale' | 'enterprise'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string | null
          name: string
          avatar_url: string | null
          email_verified: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash?: string | null
          name: string
          avatar_url?: string | null
          email_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string | null
          name?: string
          avatar_url?: string | null
          email_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          brand_color: string | null
          timezone: string
          owner_id: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          logo_url?: string | null
          brand_color?: string | null
          timezone?: string
          owner_id: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          brand_color?: string | null
          timezone?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agencies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agency_subscriptions: {
        Row: {
          id: string
          agency_id: string
          tier: SubscriptionTier
          status: SubscriptionStatus
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          active_client_limit_override: number | null
          project_limit_override: number | null
          staff_limit_override: number | null
          storage_limit_gb_override: number | null
          white_label_enabled: boolean
          custom_domain: string | null
          extra_clients_purchased: number
          extra_storage_gb_purchased: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          tier?: SubscriptionTier
          status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          active_client_limit_override?: number | null
          project_limit_override?: number | null
          staff_limit_override?: number | null
          storage_limit_gb_override?: number | null
          white_label_enabled?: boolean
          custom_domain?: string | null
          extra_clients_purchased?: number
          extra_storage_gb_purchased?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          tier?: SubscriptionTier
          status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          active_client_limit_override?: number | null
          project_limit_override?: number | null
          staff_limit_override?: number | null
          storage_limit_gb_override?: number | null
          white_label_enabled?: boolean
          custom_domain?: string | null
          extra_clients_purchased?: number
          extra_storage_gb_purchased?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_subscriptions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      tier_limits: {
        Row: {
          tier: SubscriptionTier
          active_client_limit: number | null
          project_limit: number | null
          staff_limit: number | null
          storage_limit_gb: number | null
          monthly_price_cents: number | null
          annual_price_cents: number | null
          features: Json
        }
        Insert: {
          tier: SubscriptionTier
          active_client_limit?: number | null
          project_limit?: number | null
          staff_limit?: number | null
          storage_limit_gb?: number | null
          monthly_price_cents?: number | null
          annual_price_cents?: number | null
          features?: Json
        }
        Update: {
          tier?: SubscriptionTier
          active_client_limit?: number | null
          project_limit?: number | null
          staff_limit?: number | null
          storage_limit_gb?: number | null
          monthly_price_cents?: number | null
          annual_price_cents?: number | null
          features?: Json
        }
        Relationships: []
      }
      agency_members: {
        Row: {
          id: string
          agency_id: string
          user_id: string | null
          role: UserRole
          invitation_email: string | null
          invitation_token: string | null
          invitation_expires_at: string | null
          invited_by: string | null
          invited_at: string | null
          joined_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          user_id?: string | null
          role?: UserRole
          invitation_email?: string | null
          invitation_token?: string | null
          invitation_expires_at?: string | null
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          user_id?: string | null
          role?: UserRole
          invitation_email?: string | null
          invitation_token?: string | null
          invitation_expires_at?: string | null
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          agency_id: string
          name: string
          description: string | null
          status: ProjectStatus
          project_url: string | null
          staging_url: string | null
          hosting_provider: string | null
          tech_stack: string | null
          payment_link: string | null
          created_by: string
          updated_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          agency_id: string
          name: string
          description?: string | null
          status?: ProjectStatus
          project_url?: string | null
          staging_url?: string | null
          hosting_provider?: string | null
          tech_stack?: string | null
          payment_link?: string | null
          created_by: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          agency_id?: string
          name?: string
          description?: string | null
          status?: ProjectStatus
          project_url?: string | null
          staging_url?: string | null
          hosting_provider?: string | null
          tech_stack?: string | null
          payment_link?: string | null
          created_by?: string
          updated_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          role: ProjectMemberRole
          invitation_email: string | null
          invitation_token: string | null
          invitation_expires_at: string | null
          invited_by: string | null
          invited_at: string | null
          joined_at: string | null
          email_notifications: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          role: ProjectMemberRole
          invitation_email?: string | null
          invitation_token?: string | null
          invitation_expires_at?: string | null
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string | null
          email_notifications?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string | null
          role?: ProjectMemberRole
          invitation_email?: string | null
          invitation_token?: string | null
          invitation_expires_at?: string | null
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string | null
          email_notifications?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      project_notes: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string | null
          content: string
          is_pinned: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title?: string | null
          content: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          title?: string | null
          content?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      requests: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string
          type: RequestType
          priority: RequestPriority
          status: RequestStatus
          created_by: string
          updated_by: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description: string
          type: RequestType
          priority?: RequestPriority
          status?: RequestStatus
          created_by: string
          updated_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string
          type?: RequestType
          priority?: RequestPriority
          status?: RequestStatus
          created_by?: string
          updated_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      request_assignments: {
        Row: {
          id: string
          request_id: string
          user_id: string
          assigned_by: string
          assigned_at: string
        }
        Insert: {
          id?: string
          request_id: string
          user_id: string
          assigned_by: string
          assigned_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          user_id?: string
          assigned_by?: string
          assigned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      request_messages: {
        Row: {
          id: string
          request_id: string
          user_id: string
          content: string
          is_internal: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          request_id: string
          user_id: string
          content: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          user_id?: string
          content?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      attachments: {
        Row: {
          id: string
          request_id: string | null
          message_id: string | null
          note_id: string | null
          file_name: string
          file_path: string
          file_url: string
          file_size: number
          file_type: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          request_id?: string | null
          message_id?: string | null
          note_id?: string | null
          file_name: string
          file_path: string
          file_url: string
          file_size: number
          file_type: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string | null
          message_id?: string | null
          note_id?: string | null
          file_name?: string
          file_path?: string
          file_url?: string
          file_size?: number
          file_type?: string
          uploaded_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "request_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "project_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          reference_type: string | null
          reference_id: string | null
          data: Json
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          reference_type?: string | null
          reference_id?: string | null
          data?: Json
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          reference_type?: string | null
          reference_id?: string | null
          data?: Json
          read_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          email_new_request: boolean
          email_status_change: boolean
          email_new_reply: boolean
          email_assignment: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          email_new_request?: boolean
          email_status_change?: boolean
          email_new_reply?: boolean
          email_assignment?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          email_new_request?: boolean
          email_status_change?: boolean
          email_new_reply?: boolean
          email_assignment?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conversation_mutes: {
        Row: {
          id: string
          user_id: string
          request_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          request_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          request_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_mutes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_mutes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          }
        ]
      }
      request_activity_log: {
        Row: {
          id: string
          request_id: string
          user_id: string
          action: string
          old_value: string | null
          new_value: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          user_id: string
          action: string
          old_value?: string | null
          new_value?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          user_id?: string
          action?: string
          old_value?: string | null
          new_value?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_activity_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_devices: {
        Row: {
          id: string
          user_id: string
          device_token: string
          platform: string
          device_name: string | null
          last_used_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          device_token: string
          platform: string
          device_name?: string | null
          last_used_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          device_token?: string
          platform?: string
          device_name?: string | null
          last_used_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      active_clients_count: {
        Row: {
          agency_id: string | null
          active_client_count: number | null
        }
        Relationships: []
      }
      agency_storage_usage: {
        Row: {
          agency_id: string | null
          total_bytes: number | null
          total_gb: number | null
        }
        Relationships: []
      }
      agency_stats: {
        Row: {
          agency_id: string | null
          active_projects: number | null
          total_projects: number | null
          submitted_requests: number | null
          in_progress_requests: number | null
          complete_requests: number | null
          staff_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_agency_slug: {
        Args: { agency_name: string }
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<string, never>
        Returns: string
      }
      check_agency_limits: {
        Args: { p_agency_id: string; p_limit_type: string }
        Returns: { current_count: number; limit_value: number; within_limit: boolean }[]
      }
    }
    Enums: {
      user_role: UserRole
      project_member_role: ProjectMemberRole
      project_status: ProjectStatus
      request_type: RequestType
      request_priority: RequestPriority
      request_status: RequestStatus
      subscription_status: SubscriptionStatus
      subscription_tier: SubscriptionTier
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']

// Commonly used types
export type User = Tables<'users'>
export type Agency = Tables<'agencies'>
export type AgencySubscription = Tables<'agency_subscriptions'>
export type TierLimit = Tables<'tier_limits'>
export type AgencyMember = Tables<'agency_members'>
export type Project = Tables<'projects'>
export type ProjectMember = Tables<'project_members'>
export type ProjectNote = Tables<'project_notes'>
export type Request = Tables<'requests'>
export type RequestAssignment = Tables<'request_assignments'>
export type RequestMessage = Tables<'request_messages'>
export type Attachment = Tables<'attachments'>
export type Notification = Tables<'notifications'>
export type NotificationPreference = Tables<'notification_preferences'>
export type ConversationMute = Tables<'conversation_mutes'>
export type RequestActivityLog = Tables<'request_activity_log'>
export type UserDevice = Tables<'user_devices'>

// View types (explicit for better type inference)
export type ActiveClientsCountView = Views<'active_clients_count'>
export type AgencyStorageUsageView = Views<'agency_storage_usage'>
export type AgencyStatsView = Views<'agency_stats'>
