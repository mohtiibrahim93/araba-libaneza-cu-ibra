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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      availability_rules: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: []
      }
      booking_event_types: {
        Row: {
          buffer_after_min: number
          buffer_before_min: number
          created_at: string
          description_en: string | null
          description_ro: string | null
          duration_min: number
          id: string
          is_active: boolean
          max_advance_days: number
          min_notice_hours: number
          name_en: string
          name_ro: string
          price_cents: number
          requires_payment: boolean
          slug: string
          updated_at: string
        }
        Insert: {
          buffer_after_min?: number
          buffer_before_min?: number
          created_at?: string
          description_en?: string | null
          description_ro?: string | null
          duration_min: number
          id?: string
          is_active?: boolean
          max_advance_days?: number
          min_notice_hours?: number
          name_en: string
          name_ro: string
          price_cents?: number
          requires_payment?: boolean
          slug: string
          updated_at?: string
        }
        Update: {
          buffer_after_min?: number
          buffer_before_min?: number
          created_at?: string
          description_en?: string | null
          description_ro?: string | null
          duration_min?: number
          id?: string
          is_active?: boolean
          max_advance_days?: number
          min_notice_hours?: number
          name_en?: string
          name_ro?: string
          price_cents?: number
          requires_payment?: boolean
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cancelled_at: string | null
          created_at: string
          end_at: string
          event_type_slug: string
          format: string
          gdpr_consent_at: string | null
          google_event_id: string | null
          id: string
          language: string
          manage_token: string
          meet_link: string | null
          notes: string | null
          original_booking_id: string | null
          reminder_1h_sent_at: string | null
          reminder_24h_sent_at: string | null
          start_at: string
          status: string
          student_email: string
          student_name: string
          student_phone: string | null
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          end_at: string
          event_type_slug: string
          format?: string
          gdpr_consent_at?: string | null
          google_event_id?: string | null
          id?: string
          language?: string
          manage_token?: string
          meet_link?: string | null
          notes?: string | null
          original_booking_id?: string | null
          reminder_1h_sent_at?: string | null
          reminder_24h_sent_at?: string | null
          start_at: string
          status?: string
          student_email: string
          student_name: string
          student_phone?: string | null
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          end_at?: string
          event_type_slug?: string
          format?: string
          gdpr_consent_at?: string | null
          google_event_id?: string | null
          id?: string
          language?: string
          manage_token?: string
          meet_link?: string | null
          notes?: string | null
          original_booking_id?: string | null
          reminder_1h_sent_at?: string | null
          reminder_24h_sent_at?: string | null
          start_at?: string
          status?: string
          student_email?: string
          student_name?: string
          student_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_type_slug_fkey"
            columns: ["event_type_slug"]
            isOneToOne: false
            referencedRelation: "booking_event_types"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "bookings_original_booking_id_fkey"
            columns: ["original_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      email_confirmation_settings: {
        Row: {
          id: number
          sender_email: string
          sender_name: string
          updated_at: string
        }
        Insert: {
          id?: number
          sender_email?: string
          sender_name?: string
          updated_at?: string
        }
        Update: {
          id?: number
          sender_email?: string
          sender_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      group_capacities: {
        Row: {
          form_type: string
          id: string
          level: string | null
          max_seats: number
          min_seats: number
          updated_at: string
        }
        Insert: {
          form_type: string
          id?: string
          level?: string | null
          max_seats?: number
          min_seats?: number
          updated_at?: string
        }
        Update: {
          form_type?: string
          id?: string
          level?: string | null
          max_seats?: number
          min_seats?: number
          updated_at?: string
        }
        Relationships: []
      }
      group_cohorts: {
        Row: {
          created_at: string
          form_type: string
          id: string
          is_active: boolean
          level: string | null
          max_seats: number
          schedule_label_en: string
          schedule_label_ro: string
          sort_order: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          form_type: string
          id?: string
          is_active?: boolean
          level?: string | null
          max_seats?: number
          schedule_label_en?: string
          schedule_label_ro?: string
          sort_order?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          form_type?: string
          id?: string
          is_active?: boolean
          level?: string | null
          max_seats?: number
          schedule_label_en?: string
          schedule_label_ro?: string
          sort_order?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      kids_class_slots: {
        Row: {
          created_at: string
          duration_min: number
          format: string
          id: string
          is_active: boolean
          location: string | null
          max_seats: number
          sort_order: number
          start_time: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          duration_min?: number
          format: string
          id?: string
          is_active?: boolean
          location?: string | null
          max_seats?: number
          sort_order?: number
          start_time: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          duration_min?: number
          format?: string
          id?: string
          is_active?: boolean
          location?: string | null
          max_seats?: number
          sort_order?: number
          start_time?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: []
      }
      lead_status_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          new_status: string
          previous_status: string | null
          registration_id: string
        }
        Insert: {
          changed_by?: string
          created_at?: string
          id?: string
          new_status: string
          previous_status?: string | null
          registration_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          new_status?: string
          previous_status?: string | null
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          center: string | null
          child_age: string | null
          cohort_id: string | null
          created_at: string
          email: string | null
          form_type: string
          format: string | null
          id: string
          is_waitlist_deposit: boolean
          kids_slot_id: string | null
          lead_status: string
          level: string | null
          name: string
          notes: string | null
          paid_at: string | null
          payment_status: string
          phone: string
          referral_code: string | null
          sms_confirmation_opt_in: boolean
          stripe_session_id: string | null
          whatsapp_sent_at: string | null
        }
        Insert: {
          center?: string | null
          child_age?: string | null
          cohort_id?: string | null
          created_at?: string
          email?: string | null
          form_type: string
          format?: string | null
          id?: string
          is_waitlist_deposit?: boolean
          kids_slot_id?: string | null
          lead_status?: string
          level?: string | null
          name: string
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          phone: string
          referral_code?: string | null
          sms_confirmation_opt_in?: boolean
          stripe_session_id?: string | null
          whatsapp_sent_at?: string | null
        }
        Update: {
          center?: string | null
          child_age?: string | null
          cohort_id?: string | null
          created_at?: string
          email?: string | null
          form_type?: string
          format?: string | null
          id?: string
          is_waitlist_deposit?: boolean
          kids_slot_id?: string | null
          lead_status?: string
          level?: string | null
          name?: string
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          phone?: string
          referral_code?: string | null
          sms_confirmation_opt_in?: boolean
          stripe_session_id?: string | null
          whatsapp_sent_at?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_cohort_signup_counts: {
        Args: never
        Returns: {
          cohort_id: string
          taken: number
        }[]
      }
      get_kids_slot_signup_counts: {
        Args: never
        Returns: {
          kids_slot_id: string
          taken: number
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
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
