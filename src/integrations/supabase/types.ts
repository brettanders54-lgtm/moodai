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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_tasks: {
        Row: {
          assigned_to: string | null
          branch: string
          category: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string
          id: string
          notes: string | null
          priority: string
          source_analysis_date: string
          status: string
          target_employee: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          branch: string
          category: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description: string
          id?: string
          notes?: string | null
          priority: string
          source_analysis_date?: string
          status?: string
          target_employee?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          branch?: string
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string
          id?: string
          notes?: string | null
          priority?: string
          source_analysis_date?: string
          status?: string
          target_employee?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      anonymous_suggestions: {
        Row: {
          admin_notes: string | null
          branch: string
          category: string
          created_at: string
          department: string
          id: string
          priority: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          suggestion_text: string
        }
        Insert: {
          admin_notes?: string | null
          branch: string
          category?: string
          created_at?: string
          department: string
          id?: string
          priority?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggestion_text: string
        }
        Update: {
          admin_notes?: string | null
          branch?: string
          category?: string
          created_at?: string
          department?: string
          id?: string
          priority?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggestion_text?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      burnout_alerts: {
        Row: {
          branch: string
          created_at: string
          department: string
          detected_at: string
          employee_code: string
          id: string
          is_resolved: boolean
          reason_category: string
          risk_score: number
        }
        Insert: {
          branch: string
          created_at?: string
          department: string
          detected_at?: string
          employee_code: string
          id?: string
          is_resolved?: boolean
          reason_category: string
          risk_score: number
        }
        Update: {
          branch?: string
          created_at?: string
          department?: string
          detected_at?: string
          employee_code?: string
          id?: string
          is_resolved?: boolean
          reason_category?: string
          risk_score?: number
        }
        Relationships: []
      }
      cms_content: {
        Row: {
          content_key: string
          content_type: string
          content_value: string
          created_at: string
          id: string
          is_active: boolean | null
          publish_at: string | null
          section: string
          sort_order: number | null
          unpublish_at: string | null
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          publish_at?: string | null
          section?: string
          sort_order?: number | null
          unpublish_at?: string | null
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          publish_at?: string | null
          section?: string
          sort_order?: number | null
          unpublish_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cms_content_versions: {
        Row: {
          content_id: string
          content_table: string
          created_at: string
          created_by: string | null
          id: string
          version_data: Json
          version_number: number
        }
        Insert: {
          content_id: string
          content_table: string
          created_at?: string
          created_by?: string | null
          id?: string
          version_data: Json
          version_number?: number
        }
        Update: {
          content_id?: string
          content_table?: string
          created_at?: string
          created_by?: string | null
          id?: string
          version_data?: Json
          version_number?: number
        }
        Relationships: []
      }
      cms_faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean | null
          publish_at: string | null
          question: string
          sort_order: number | null
          unpublish_at: string | null
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          publish_at?: string | null
          question: string
          sort_order?: number | null
          unpublish_at?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          publish_at?: string | null
          question?: string
          sort_order?: number | null
          unpublish_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cms_media: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          folder: string | null
          id: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string
          file_url: string
          folder?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          folder?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_menus: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          menu_group: string
          open_in_new_tab: boolean | null
          parent_id: string | null
          sort_order: number | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          menu_group?: string
          open_in_new_tab?: boolean | null
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          menu_group?: string
          open_in_new_tab?: boolean | null
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_menus_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cms_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_partners: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          sort_order: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          sort_order?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          sort_order?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      cms_seo: {
        Row: {
          canonical_url: string | null
          created_at: string
          id: string
          meta_description: string | null
          meta_title: string | null
          no_index: boolean | null
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          page_path: string
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          no_index?: boolean | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_path: string
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          no_index?: boolean | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_translations: {
        Row: {
          content_id: string
          content_table: string
          created_at: string
          field_name: string
          id: string
          locale: string
          translated_value: string
          updated_at: string
        }
        Insert: {
          content_id: string
          content_table: string
          created_at?: string
          field_name: string
          id?: string
          locale?: string
          translated_value: string
          updated_at?: string
        }
        Update: {
          content_id?: string
          content_table?: string
          created_at?: string
          field_name?: string
          id?: string
          locale?: string
          translated_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_responses: {
        Row: {
          branch: string
          created_at: string
          department: string
          employee_code: string
          id: string
          mood: string
          reason: string | null
          reason_category: string | null
          response_date: string
        }
        Insert: {
          branch: string
          created_at?: string
          department: string
          employee_code: string
          id?: string
          mood: string
          reason?: string | null
          reason_category?: string | null
          response_date?: string
        }
        Update: {
          branch?: string
          created_at?: string
          department?: string
          employee_code?: string
          id?: string
          mood?: string
          reason?: string | null
          reason_category?: string | null
          response_date?: string
        }
        Relationships: []
      }
      external_metrics: {
        Row: {
          branch: string
          created_at: string
          customer_complaints: number | null
          customer_count: number | null
          daily_sales: number | null
          id: string
          metric_date: string
          returns_count: number | null
          source_system: string | null
          updated_at: string
        }
        Insert: {
          branch: string
          created_at?: string
          customer_complaints?: number | null
          customer_count?: number | null
          daily_sales?: number | null
          id?: string
          metric_date?: string
          returns_count?: number | null
          source_system?: string | null
          updated_at?: string
        }
        Update: {
          branch?: string
          created_at?: string
          customer_complaints?: number | null
          customer_count?: number | null
          daily_sales?: number | null
          id?: string
          metric_date?: string
          returns_count?: number | null
          source_system?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      manager_actions: {
        Row: {
          action_description: string
          action_type: Database["public"]["Enums"]["action_type"]
          alert_id: string
          completed_at: string | null
          created_at: string
          effectiveness_score: number | null
          id: string
          manager_name: string
          notes: string | null
          started_at: string
          status: Database["public"]["Enums"]["action_status"]
          updated_at: string
        }
        Insert: {
          action_description: string
          action_type: Database["public"]["Enums"]["action_type"]
          alert_id: string
          completed_at?: string | null
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          manager_name: string
          notes?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["action_status"]
          updated_at?: string
        }
        Update: {
          action_description?: string
          action_type?: Database["public"]["Enums"]["action_type"]
          alert_id?: string
          completed_at?: string | null
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          manager_name?: string
          notes?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["action_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_actions_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "burnout_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_branches: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          branch: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          branch: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          branch?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      manager_notifications: {
        Row: {
          branch: string
          created_at: string
          id: string
          is_read: boolean
          manager_user_id: string
          message: string
          notification_type: string
          related_alert_id: string | null
          sent_via_push: boolean | null
          title: string
          urgency: string | null
        }
        Insert: {
          branch: string
          created_at?: string
          id?: string
          is_read?: boolean
          manager_user_id: string
          message: string
          notification_type?: string
          related_alert_id?: string | null
          sent_via_push?: boolean | null
          title: string
          urgency?: string | null
        }
        Update: {
          branch?: string
          created_at?: string
          id?: string
          is_read?: boolean
          manager_user_id?: string
          message?: string
          notification_type?: string
          related_alert_id?: string | null
          sent_via_push?: boolean | null
          title?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manager_notifications_related_alert_id_fkey"
            columns: ["related_alert_id"]
            isOneToOne: false
            referencedRelation: "burnout_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_predictions: {
        Row: {
          branch: string
          complaint_risk_percent: number | null
          confidence_score: number | null
          created_at: string
          expires_at: string | null
          factors: Json | null
          id: string
          prediction_date: string
          prediction_text: string | null
          sales_impact_percent: number | null
          stress_change_percent: number | null
        }
        Insert: {
          branch: string
          complaint_risk_percent?: number | null
          confidence_score?: number | null
          created_at?: string
          expires_at?: string | null
          factors?: Json | null
          id?: string
          prediction_date?: string
          prediction_text?: string | null
          sales_impact_percent?: number | null
          stress_change_percent?: number | null
        }
        Update: {
          branch?: string
          complaint_risk_percent?: number | null
          confidence_score?: number | null
          created_at?: string
          expires_at?: string | null
          factors?: Json | null
          id?: string
          prediction_date?: string
          prediction_text?: string | null
          sales_impact_percent?: number | null
          stress_change_percent?: number | null
        }
        Relationships: []
      }
      satisfaction_targets: {
        Row: {
          branch: string | null
          created_at: string
          created_by: string | null
          current_value: number | null
          department: string | null
          id: string
          period_end: string
          period_start: string
          status: string
          target_type: string
          target_value: number
          updated_at: string
        }
        Insert: {
          branch?: string | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          department?: string | null
          id?: string
          period_end: string
          period_start: string
          status?: string
          target_type?: string
          target_value: number
          updated_at?: string
        }
        Update: {
          branch?: string | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          department?: string | null
          id?: string
          period_end?: string
          period_start?: string
          status?: string
          target_type?: string
          target_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      get_user_branch: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_status: "pending" | "in_progress" | "completed" | "cancelled"
      action_type:
        | "one_on_one"
        | "workload_adjustment"
        | "schedule_change"
        | "team_meeting"
        | "training"
        | "other"
      app_role: "hr" | "manager" | "employee" | "admin"
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
    Enums: {
      action_status: ["pending", "in_progress", "completed", "cancelled"],
      action_type: [
        "one_on_one",
        "workload_adjustment",
        "schedule_change",
        "team_meeting",
        "training",
        "other",
      ],
      app_role: ["hr", "manager", "employee", "admin"],
    },
  },
} as const
