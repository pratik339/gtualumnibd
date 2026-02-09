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
      branches: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      colleges: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          rejection_reason: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          rejection_reason?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          rejection_reason?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      high_commissions: {
        Row: {
          country: string | null
          created_at: string
          id: string
          name: string
          type: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          achievements: string | null
          branch_id: string | null
          college_id: string | null
          company: string | null
          created_at: string
          current_semester: number | null
          email: string | null
          email_visible: boolean | null
          enrollment_number: string | null
          expected_passout_year: number | null
          experience: string | null
          facebook_url: string | null
          facebook_visible: boolean | null
          full_name: string
          funding_type: string | null
          high_commission_id: string | null
          id: string
          job_title: string | null
          joining_year: number | null
          linkedin_url: string | null
          linkedin_visible: boolean | null
          location_city: string | null
          location_country: string | null
          passout_year: number | null
          photo_url: string | null
          projects: string | null
          rejection_reason: string | null
          scholarship_year: number | null
          status: Database["public"]["Enums"]["approval_status"]
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
          whatsapp_number: string | null
          whatsapp_visible: boolean | null
        }
        Insert: {
          achievements?: string | null
          branch_id?: string | null
          college_id?: string | null
          company?: string | null
          created_at?: string
          current_semester?: number | null
          email?: string | null
          email_visible?: boolean | null
          enrollment_number?: string | null
          expected_passout_year?: number | null
          experience?: string | null
          facebook_url?: string | null
          facebook_visible?: boolean | null
          full_name: string
          funding_type?: string | null
          high_commission_id?: string | null
          id?: string
          job_title?: string | null
          joining_year?: number | null
          linkedin_url?: string | null
          linkedin_visible?: boolean | null
          location_city?: string | null
          location_country?: string | null
          passout_year?: number | null
          photo_url?: string | null
          projects?: string | null
          rejection_reason?: string | null
          scholarship_year?: number | null
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
          whatsapp_number?: string | null
          whatsapp_visible?: boolean | null
        }
        Update: {
          achievements?: string | null
          branch_id?: string | null
          college_id?: string | null
          company?: string | null
          created_at?: string
          current_semester?: number | null
          email?: string | null
          email_visible?: boolean | null
          enrollment_number?: string | null
          expected_passout_year?: number | null
          experience?: string | null
          facebook_url?: string | null
          facebook_visible?: boolean | null
          full_name?: string
          funding_type?: string | null
          high_commission_id?: string | null
          id?: string
          job_title?: string | null
          joining_year?: number | null
          linkedin_url?: string | null
          linkedin_visible?: boolean | null
          location_city?: string | null
          location_country?: string | null
          passout_year?: number | null
          photo_url?: string | null
          projects?: string | null
          rejection_reason?: string | null
          scholarship_year?: number | null
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          whatsapp_number?: string | null
          whatsapp_visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_high_commission_id_fkey"
            columns: ["high_commission_id"]
            isOneToOne: false
            referencedRelation: "high_commissions"
            referencedColumns: ["id"]
          },
        ]
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
      profiles_secure: {
        Row: {
          achievements: string | null
          branch_id: string | null
          college_id: string | null
          company: string | null
          created_at: string | null
          current_semester: number | null
          email: string | null
          email_visible: boolean | null
          enrollment_number: string | null
          expected_passout_year: number | null
          experience: string | null
          facebook_url: string | null
          facebook_visible: boolean | null
          full_name: string | null
          high_commission_id: string | null
          id: string | null
          job_title: string | null
          linkedin_url: string | null
          linkedin_visible: boolean | null
          location_city: string | null
          location_country: string | null
          passout_year: number | null
          photo_url: string | null
          projects: string | null
          rejection_reason: string | null
          scholarship_year: number | null
          status: Database["public"]["Enums"]["approval_status"] | null
          updated_at: string | null
          user_id: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
          whatsapp_number: string | null
          whatsapp_visible: boolean | null
        }
        Insert: {
          achievements?: string | null
          branch_id?: string | null
          college_id?: string | null
          company?: string | null
          created_at?: string | null
          current_semester?: number | null
          email?: never
          email_visible?: boolean | null
          enrollment_number?: never
          expected_passout_year?: number | null
          experience?: string | null
          facebook_url?: never
          facebook_visible?: boolean | null
          full_name?: string | null
          high_commission_id?: string | null
          id?: string | null
          job_title?: string | null
          linkedin_url?: never
          linkedin_visible?: boolean | null
          location_city?: string | null
          location_country?: string | null
          passout_year?: number | null
          photo_url?: string | null
          projects?: string | null
          rejection_reason?: string | null
          scholarship_year?: number | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          whatsapp_number?: never
          whatsapp_visible?: boolean | null
        }
        Update: {
          achievements?: string | null
          branch_id?: string | null
          college_id?: string | null
          company?: string | null
          created_at?: string | null
          current_semester?: number | null
          email?: never
          email_visible?: boolean | null
          enrollment_number?: never
          expected_passout_year?: number | null
          experience?: string | null
          facebook_url?: never
          facebook_visible?: boolean | null
          full_name?: string | null
          high_commission_id?: string | null
          id?: string | null
          job_title?: string | null
          linkedin_url?: never
          linkedin_visible?: boolean | null
          location_city?: string | null
          location_country?: string | null
          passout_year?: number | null
          photo_url?: string | null
          projects?: string | null
          rejection_reason?: string | null
          scholarship_year?: number | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          whatsapp_number?: never
          whatsapp_visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_high_commission_id_fkey"
            columns: ["high_commission_id"]
            isOneToOne: false
            referencedRelation: "high_commissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_public_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { conv_id: string; uid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      approval_status: "pending" | "approved" | "rejected"
      connection_status: "pending" | "accepted" | "rejected"
      user_type: "alumni" | "scholar" | "student"
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
      app_role: ["admin", "moderator", "user"],
      approval_status: ["pending", "approved", "rejected"],
      connection_status: ["pending", "accepted", "rejected"],
      user_type: ["alumni", "scholar", "student"],
    },
  },
} as const
