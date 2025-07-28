export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      chat_history: {
        Row: {
          created_at: string | null
          file_id: string | null
          id: string
          is_user_message: boolean | null
          message: string
          response: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_id?: string | null
          id?: string
          is_user_message?: boolean | null
          message: string
          response?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_id?: string | null
          id?: string
          is_user_message?: boolean | null
          message?: string
          response?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          age: number | null
          created_at: string | null
          customer_id: string
          dataset_id: string | null
          email: string | null
          gender: string | null
          id: string
          last_purchase_date: string | null
          name: string | null
          risk_level: string | null
          segment: string | null
          total_orders: number | null
          total_spent: number | null
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          customer_id: string
          dataset_id?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          last_purchase_date?: string | null
          name?: string | null
          risk_level?: string | null
          segment?: string | null
          total_orders?: number | null
          total_spent?: number | null
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string | null
          customer_id?: string
          dataset_id?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          last_purchase_date?: string | null
          name?: string | null
          risk_level?: string | null
          segment?: string | null
          total_orders?: number | null
          total_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          created_at: string | null
          file_type: string | null
          file_url: string | null
          id: string
          insights: Json | null
          metadata: Json | null
          name: string
          row_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          insights?: Json | null
          metadata?: Json | null
          name: string
          row_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          insights?: Json | null
          metadata?: Json | null
          name?: string
          row_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string | null
          databricks_job_id: string | null
          error_message: string | null
          file_name: string
          file_size: number | null
          file_type: string
          id: string
          metadata: Json | null
          processed_at: string | null
          status: Database["public"]["Enums"]["file_status"] | null
          storage_url: string
          updated_at: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          databricks_job_id?: string | null
          error_message?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["file_status"] | null
          storage_url: string
          updated_at?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          databricks_job_id?: string | null
          error_message?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["file_status"] | null
          storage_url?: string
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          data: Json | null
          description: string | null
          file_id: string
          id: string
          insight_type: Database["public"]["Enums"]["insight_type"]
          title: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          data?: Json | null
          description?: string | null
          file_id: string
          id?: string
          insight_type: Database["public"]["Enums"]["insight_type"]
          title: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          data?: Json | null
          description?: string | null
          file_id?: string
          id?: string
          insight_type?: Database["public"]["Enums"]["insight_type"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_file_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_file_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_file_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_file_id_fkey"
            columns: ["related_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_invitations: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          full_name: string
          id: string
          industry: string | null
          invitation_token: string
          invited_at: string | null
          invited_by: string
          used_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          full_name: string
          id?: string
          industry?: string | null
          invitation_token: string
          invited_at?: string | null
          invited_by: string
          used_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          full_name?: string
          id?: string
          industry?: string | null
          invitation_token?: string
          invited_at?: string | null
          invited_by?: string
          used_at?: string | null
        }
        Relationships: []
      }
      pipelines: {
        Row: {
          configuration: Json | null
          created_at: string | null
          dataset_id: string | null
          description: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          dataset_id?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          dataset_id?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_logs: {
        Row: {
          completed_at: string | null
          details: Json | null
          error_details: string | null
          file_id: string
          id: string
          operation: string
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          details?: Json | null
          error_details?: string | null
          file_id: string
          id?: string
          operation: string
          started_at?: string | null
          status: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          details?: Json | null
          error_details?: string | null
          file_id?: string
          id?: string
          operation?: string
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_logs_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepted_terms: boolean | null
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          industry: string | null
          invitation_token: string | null
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_terms?: boolean | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          invitation_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_terms?: boolean | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          invitation_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string | null
          dataset_id: string | null
          id: string
          product_category: string | null
          product_name: string | null
          quantity: number | null
          transaction_date: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id?: string | null
          dataset_id?: string | null
          id?: string
          product_category?: string | null
          product_name?: string | null
          quantity?: number | null
          transaction_date: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string | null
          dataset_id?: string | null
          id?: string
          product_category?: string | null
          product_name?: string | null
          quantity?: number | null
          transaction_date?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_invited_user: {
        Args: { user_uuid: string; token: string }
        Returns: boolean
      }
      cleanup_file_data: {
        Args: { file_uuid: string }
        Returns: undefined
      }
      create_admin_user: {
        Args: {
          admin_email: string
          admin_password: string
          admin_name: string
        }
        Returns: string
      }
      create_invitation: {
        Args: {
          invite_email: string
          invite_name: string
          invite_company: string
          invite_industry?: string
        }
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          full_name: string
          company_name: string
          role: Database["public"]["Enums"]["user_role"]
          user_created_at: string
          is_active: boolean
          total_files: number
          processed_files: number
          failed_files: number
          last_upload: string
          total_chat_messages: number
        }[]
      }
      get_user_stats: {
        Args: { user_uuid?: string }
        Returns: {
          total_files: number
          processed_files: number
          error_files: number
          pending_files: number
          total_insights: number
          unread_notifications: number
          chat_messages: number
        }[]
      }
      invite_user: {
        Args: {
          invite_email: string
          invite_name: string
          invite_company: string
          invite_industry?: string
        }
        Returns: string
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      trigger_databricks_processing: {
        Args: { file_uuid: string }
        Returns: undefined
      }
      use_invitation: {
        Args: { user_uuid: string; token: string }
        Returns: boolean
      }
      validate_invitation: {
        Args: { token: string }
        Returns: Json
      }
    }
    Enums: {
      file_status: "uploaded" | "processing" | "done" | "error"
      insight_type:
        | "cluster"
        | "anomaly"
        | "trend"
        | "summary"
        | "recommendation"
      user_role: "admin" | "client"
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
      file_status: ["uploaded", "processing", "done", "error"],
      insight_type: [
        "cluster",
        "anomaly",
        "trend",
        "summary",
        "recommendation",
      ],
      user_role: ["admin", "client"],
    },
  },
} as const
