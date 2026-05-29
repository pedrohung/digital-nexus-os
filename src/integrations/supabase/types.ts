export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agency_configs: {
        Row: {
          agency_business_id: string
          created_at: string
          custom_domain: string | null
          id: string
          logo_url: string | null
          primary_color: string
          updated_at: string
          white_label_enabled: boolean
        }
        Insert: {
          agency_business_id: string
          created_at?: string
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string
          updated_at?: string
          white_label_enabled?: boolean
        }
        Update: {
          agency_business_id?: string
          created_at?: string
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string
          updated_at?: string
          white_label_enabled?: boolean
        }
        Relationships: []
      }
      ai_logs: {
        Row: {
          action: string
          business_id: string | null
          created_at: string
          id: string
          payload: Json | null
          status: string
          user_id: string | null
        }
        Insert: {
          action: string
          business_id?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          status?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          business_id?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_swarm_executions: {
        Row: {
          business_id: string
          efficiency_gain_percent: number
          executed_at: string
          id: string
          log_details: Json
          total_budget_reallocated: number
        }
        Insert: {
          business_id: string
          efficiency_gain_percent: number
          executed_at?: string
          id?: string
          log_details?: Json
          total_budget_reallocated: number
        }
        Update: {
          business_id?: string
          efficiency_gain_percent?: number
          executed_at?: string
          id?: string
          log_details?: Json
          total_budget_reallocated?: number
        }
        Relationships: []
      }
      businesses: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          name: string
          primary_channel: string | null
          revenue_goal: number | null
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          primary_channel?: string | null
          revenue_goal?: number | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          primary_channel?: string | null
          revenue_goal?: number | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_mappings: {
        Row: {
          agency_business_id: string
          billing_split: number
          client_business_id: string
          client_label: string | null
          created_at: string
          id: string
          status: string
        }
        Insert: {
          agency_business_id: string
          billing_split?: number
          client_business_id: string
          client_label?: string | null
          created_at?: string
          id?: string
          status?: string
        }
        Update: {
          agency_business_id?: string
          billing_split?: number
          client_business_id?: string
          client_label?: string | null
          created_at?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      competitor_shadow_logs: {
        Row: {
          business_id: string
          competitor_name: string
          created_at: string
          detected_change_type: string
          id: string
          log_details: Json
          severity_level: string
          tracked_url: string | null
        }
        Insert: {
          business_id: string
          competitor_name: string
          created_at?: string
          detected_change_type: string
          id?: string
          log_details?: Json
          severity_level: string
          tracked_url?: string | null
        }
        Update: {
          business_id?: string
          competitor_name?: string
          created_at?: string
          detected_change_type?: string
          id?: string
          log_details?: Json
          severity_level?: string
          tracked_url?: string | null
        }
        Relationships: []
      }
      content_streams: {
        Row: {
          business_id: string
          campaign_core_topic: string
          created_at: string
          distribution_status: string
          generated_assets: Json
          id: string
          scheduled_for: string | null
        }
        Insert: {
          business_id: string
          campaign_core_topic: string
          created_at?: string
          distribution_status?: string
          generated_assets?: Json
          id?: string
          scheduled_for?: string | null
        }
        Update: {
          business_id?: string
          campaign_core_topic?: string
          created_at?: string
          distribution_status?: string
          generated_assets?: Json
          id?: string
          scheduled_for?: string | null
        }
        Relationships: []
      }
      customer_ltv_retention: {
        Row: {
          business_id: string
          calculated_ltv: number
          churn_risk_percent: number
          created_at: string
          customer_identifier: string
          id: string
          next_best_action: string
          updated_at: string
        }
        Insert: {
          business_id: string
          calculated_ltv: number
          churn_risk_percent: number
          created_at?: string
          customer_identifier: string
          id?: string
          next_best_action: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          calculated_ltv?: number
          churn_risk_percent?: number
          created_at?: string
          customer_identifier?: string
          id?: string
          next_best_action?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_roi_reports: {
        Row: {
          business_id: string
          calculated_roas: number
          created_at: string
          executive_summary: string | null
          id: string
          report_period: string
          revenue_generated: number
          total_spend: number
        }
        Insert: {
          business_id: string
          calculated_roas: number
          created_at?: string
          executive_summary?: string | null
          id?: string
          report_period: string
          revenue_generated: number
          total_spend: number
        }
        Update: {
          business_id?: string
          calculated_roas?: number
          created_at?: string
          executive_summary?: string | null
          id?: string
          report_period?: string
          revenue_generated?: number
          total_spend?: number
        }
        Relationships: []
      }
      integrations: {
        Row: {
          access_token: string | null
          business_id: string
          created_at: string
          id: string
          last_sync: string | null
          provider: string
          refresh_token: string | null
          scopes: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          business_id: string
          created_at?: string
          id?: string
          last_sync?: string | null
          provider: string
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          business_id?: string
          created_at?: string
          id?: string
          last_sync?: string | null
          provider?: string
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      intercepted_reviews: {
        Row: {
          business_id: string
          created_at: string
          customer_name: string
          feedback_text: string | null
          id: string
          score: number
          sentiment_score: number | null
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_name: string
          feedback_text?: string | null
          id?: string
          score: number
          sentiment_score?: number | null
          status?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_name?: string
          feedback_text?: string | null
          id?: string
          score?: number
          sentiment_score?: number | null
          status?: string
        }
        Relationships: []
      }
      local_grid_audits: {
        Row: {
          average_rank: number
          business_id: string
          competitor_data: Json
          created_at: string
          grid_size: number
          id: string
          keyword: string
        }
        Insert: {
          average_rank: number
          business_id: string
          competitor_data?: Json
          created_at?: string
          grid_size?: number
          id?: string
          keyword: string
        }
        Update: {
          average_rank?: number
          business_id?: string
          competitor_data?: Json
          created_at?: string
          grid_size?: number
          id?: string
          keyword?: string
        }
        Relationships: []
      }
      marketing_landings: {
        Row: {
          business_id: string
          conversion_count: number
          created_at: string
          html_content: string
          id: string
          performance_score: number
          slug: string
          target_offer: string | null
          title: string
        }
        Insert: {
          business_id: string
          conversion_count?: number
          created_at?: string
          html_content: string
          id?: string
          performance_score?: number
          slug: string
          target_offer?: string | null
          title: string
        }
        Update: {
          business_id?: string
          conversion_count?: number
          created_at?: string
          html_content?: string
          id?: string
          performance_score?: number
          slug?: string
          target_offer?: string | null
          title?: string
        }
        Relationships: []
      }
      metrics: {
        Row: {
          business_id: string
          created_at: string
          date: string
          id: string
          metric_key: string
          metric_value: number | null
          source: string
        }
        Insert: {
          business_id: string
          created_at?: string
          date: string
          id?: string
          metric_key: string
          metric_value?: number | null
          source: string
        }
        Update: {
          business_id?: string
          created_at?: string
          date?: string
          id?: string
          metric_key?: string
          metric_value?: number | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_id: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarded: boolean
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          onboarded?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarded?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      projections: {
        Row: {
          budget_amount: number
          business_id: string
          confidence: number
          created_at: string
          from_channel: string
          id: string
          projected_roas: number
          risk_level: string
          status: string
          to_channel: string
        }
        Insert: {
          budget_amount: number
          business_id: string
          confidence: number
          created_at?: string
          from_channel: string
          id?: string
          projected_roas: number
          risk_level: string
          status?: string
          to_channel: string
        }
        Update: {
          budget_amount?: number
          business_id?: string
          confidence?: number
          created_at?: string
          from_channel?: string
          id?: string
          projected_roas?: number
          risk_level?: string
          status?: string
          to_channel?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author: string | null
          business_id: string
          content: string | null
          created_at: string
          id: string
          platform: string
          rating: number | null
          responded: boolean
          response_content: string | null
          sentiment: string | null
        }
        Insert: {
          author?: string | null
          business_id: string
          content?: string | null
          created_at?: string
          id?: string
          platform: string
          rating?: number | null
          responded?: boolean
          response_content?: string | null
          sentiment?: string | null
        }
        Update: {
          author?: string | null
          business_id?: string
          content?: string | null
          created_at?: string
          id?: string
          platform?: string
          rating?: number | null
          responded?: boolean
          response_content?: string | null
          sentiment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      roi_receipts: {
        Row: {
          actual_impact: number | null
          business_id: string
          created_at: string
          delta_percent: number | null
          estimated_impact: number
          id: string
          projection_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_impact?: number | null
          business_id: string
          created_at?: string
          delta_percent?: number | null
          estimated_impact: number
          id?: string
          projection_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_impact?: number | null
          business_id?: string
          created_at?: string
          delta_percent?: number | null
          estimated_impact?: number
          id?: string
          projection_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roi_receipts_projection_id_fkey"
            columns: ["projection_id"]
            isOneToOne: false
            referencedRelation: "projections"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keywords: {
        Row: {
          business_id: string
          created_at: string
          difficulty: number | null
          id: string
          intent: string | null
          keyword: string
          last_checked_at: string | null
          position: number | null
          previous_position: number | null
          search_volume: number | null
          target_url: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          difficulty?: number | null
          id?: string
          intent?: string | null
          keyword: string
          last_checked_at?: string | null
          position?: number | null
          previous_position?: number | null
          search_volume?: number | null
          target_url?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          difficulty?: number | null
          id?: string
          intent?: string | null
          keyword?: string
          last_checked_at?: string | null
          position?: number | null
          previous_position?: number | null
          search_volume?: number | null
          target_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_business_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
