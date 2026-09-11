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
      audit_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          details: Json | null
          id: string
          registration_id: string | null
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          details?: Json | null
          id?: string
          registration_id?: string | null
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          details?: Json | null
          id?: string
          registration_id?: string | null
        }
        Relationships: []
      }
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
      backlink_fetch_attempts: {
        Row: {
          attempted_at: string
          created_at: string
          detail: string | null
          domain: string
          http_status: number | null
          id: string
          outcome: string
          provider: string
          trigger_source: string
        }
        Insert: {
          attempted_at?: string
          created_at?: string
          detail?: string | null
          domain: string
          http_status?: number | null
          id?: string
          outcome: string
          provider?: string
          trigger_source?: string
        }
        Update: {
          attempted_at?: string
          created_at?: string
          detail?: string | null
          domain?: string
          http_status?: number | null
          id?: string
          outcome?: string
          provider?: string
          trigger_source?: string
        }
        Relationships: []
      }
      backlink_snapshots: {
        Row: {
          anchor_distribution: Json | null
          authority_score: number | null
          backlinks_total: number | null
          created_at: string
          domain: string
          follow_links: number | null
          id: string
          metric_sources: Json
          nofollow_links: number | null
          referring_domains: number | null
          snapshot_date: string
          source: string
          top_referring_domains: Json | null
          trust_score: number | null
        }
        Insert: {
          anchor_distribution?: Json | null
          authority_score?: number | null
          backlinks_total?: number | null
          created_at?: string
          domain: string
          follow_links?: number | null
          id?: string
          metric_sources?: Json
          nofollow_links?: number | null
          referring_domains?: number | null
          snapshot_date: string
          source?: string
          top_referring_domains?: Json | null
          trust_score?: number | null
        }
        Update: {
          anchor_distribution?: Json | null
          authority_score?: number | null
          backlinks_total?: number | null
          created_at?: string
          domain?: string
          follow_links?: number | null
          id?: string
          metric_sources?: Json
          nofollow_links?: number | null
          referring_domains?: number | null
          snapshot_date?: string
          source?: string
          top_referring_domains?: Json | null
          trust_score?: number | null
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          body_en: string
          body_ro: string
          created_at: string
          description_en: string
          description_ro: string
          is_published: boolean
          lead_en: string
          lead_ro: string
          reading_minutes: number
          slug: string
          title_en: string
          title_ro: string
          updated_at: string
        }
        Insert: {
          body_en?: string
          body_ro?: string
          created_at?: string
          description_en?: string
          description_ro?: string
          is_published?: boolean
          lead_en?: string
          lead_ro?: string
          reading_minutes?: number
          slug: string
          title_en?: string
          title_ro?: string
          updated_at?: string
        }
        Update: {
          body_en?: string
          body_ro?: string
          created_at?: string
          description_en?: string
          description_ro?: string
          is_published?: boolean
          lead_en?: string
          lead_ro?: string
          reading_minutes?: number
          slug?: string
          title_en?: string
          title_ro?: string
          updated_at?: string
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
          google_sync_error: string | null
          id: string
          language: string
          manage_token: string
          meet_link: string | null
          notes: string | null
          original_booking_id: string | null
          registration_id: string
          reminder_1h_sent_at: string | null
          reminder_24h_sent_at: string | null
          reminder_2d_sent_at: string | null
          reminder_30m_sent_at: string | null
          reminder_3h_sent_at: string | null
          reminder_day_of_sent_at: string | null
          start_at: string
          status: string
          student_email: string
          student_id: string | null
          student_name: string
          student_phone: string | null
          trial_followup_2_sent_at: string | null
          trial_followup_sent_at: string | null
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
          google_sync_error?: string | null
          id?: string
          language?: string
          manage_token?: string
          meet_link?: string | null
          notes?: string | null
          original_booking_id?: string | null
          registration_id: string
          reminder_1h_sent_at?: string | null
          reminder_24h_sent_at?: string | null
          reminder_2d_sent_at?: string | null
          reminder_30m_sent_at?: string | null
          reminder_3h_sent_at?: string | null
          reminder_day_of_sent_at?: string | null
          start_at: string
          status?: string
          student_email: string
          student_id?: string | null
          student_name: string
          student_phone?: string | null
          trial_followup_2_sent_at?: string | null
          trial_followup_sent_at?: string | null
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
          google_sync_error?: string | null
          id?: string
          language?: string
          manage_token?: string
          meet_link?: string | null
          notes?: string | null
          original_booking_id?: string | null
          registration_id?: string
          reminder_1h_sent_at?: string | null
          reminder_24h_sent_at?: string | null
          reminder_2d_sent_at?: string | null
          reminder_30m_sent_at?: string | null
          reminder_3h_sent_at?: string | null
          reminder_day_of_sent_at?: string | null
          start_at?: string
          status?: string
          student_email?: string
          student_id?: string | null
          student_name?: string
          student_phone?: string | null
          trial_followup_2_sent_at?: string | null
          trial_followup_sent_at?: string | null
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
          {
            foreignKeyName: "bookings_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_meetings: {
        Row: {
          cohort_id: string
          created_at: string
          end_time: string
          id: string
          start_time: string
          weekday: number
        }
        Insert: {
          cohort_id: string
          created_at?: string
          end_time: string
          id?: string
          start_time: string
          weekday: number
        }
        Update: {
          cohort_id?: string
          created_at?: string
          end_time?: string
          id?: string
          start_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "cohort_meetings_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "group_cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      course_requests: {
        Row: {
          created_at: string
          email: string | null
          format: string | null
          id: string
          lesson_type: string | null
          level: string | null
          location_preference: string | null
          matched_cohort_id: string | null
          name: string
          notes: string | null
          phone: string
          preferred_days: number[] | null
          preferred_language: string | null
          preferred_time_block: string | null
          status: string
          track: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          format?: string | null
          id?: string
          lesson_type?: string | null
          level?: string | null
          location_preference?: string | null
          matched_cohort_id?: string | null
          name: string
          notes?: string | null
          phone: string
          preferred_days?: number[] | null
          preferred_language?: string | null
          preferred_time_block?: string | null
          status?: string
          track?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          format?: string | null
          id?: string
          lesson_type?: string | null
          level?: string | null
          location_preference?: string | null
          matched_cohort_id?: string | null
          name?: string
          notes?: string | null
          phone?: string
          preferred_days?: number[] | null
          preferred_language?: string | null
          preferred_time_block?: string | null
          status?: string
          track?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_requests_matched_cohort_id_fkey"
            columns: ["matched_cohort_id"]
            isOneToOne: false
            referencedRelation: "group_cohorts"
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
          idempotency_key: string | null
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
          idempotency_key?: string | null
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
          idempotency_key?: string | null
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
          format: string | null
          id: string
          level: string | null
          manual_offset: number
          max_seats: number
          min_seats: number
          updated_at: string
        }
        Insert: {
          form_type: string
          format?: string | null
          id?: string
          level?: string | null
          manual_offset?: number
          max_seats?: number
          min_seats?: number
          updated_at?: string
        }
        Update: {
          form_type?: string
          format?: string | null
          id?: string
          level?: string | null
          manual_offset?: number
          max_seats?: number
          min_seats?: number
          updated_at?: string
        }
        Relationships: []
      }
      group_cohorts: {
        Row: {
          age_category: string | null
          break_note_en: string | null
          break_note_ro: string | null
          content: Json
          course_type: string
          created_at: string
          days_of_week: number[] | null
          duration_minutes: number | null
          end_date: string | null
          end_date_is_estimate: boolean
          end_time: string | null
          form_type: string
          format: string | null
          id: string
          image_url: string | null
          is_active: boolean
          level: string | null
          location_id: string | null
          manual_offset: number
          max_seats: number
          price_lei: number | null
          schedule_label_en: string
          schedule_label_ro: string
          session_count: number | null
          slug: string | null
          sort_order: number
          start_date: string
          start_time: string | null
          status: string
          teaching_language: string
          timezone: string
          title_en: string | null
          title_ro: string | null
          total_hours: number | null
          track: string
          tutor_id: string | null
          updated_at: string
        }
        Insert: {
          age_category?: string | null
          break_note_en?: string | null
          break_note_ro?: string | null
          content?: Json
          course_type?: string
          created_at?: string
          days_of_week?: number[] | null
          duration_minutes?: number | null
          end_date?: string | null
          end_date_is_estimate?: boolean
          end_time?: string | null
          form_type: string
          format?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          level?: string | null
          location_id?: string | null
          manual_offset?: number
          max_seats?: number
          price_lei?: number | null
          schedule_label_en?: string
          schedule_label_ro?: string
          session_count?: number | null
          slug?: string | null
          sort_order?: number
          start_date: string
          start_time?: string | null
          status?: string
          teaching_language?: string
          timezone?: string
          title_en?: string | null
          title_ro?: string | null
          total_hours?: number | null
          track?: string
          tutor_id?: string | null
          updated_at?: string
        }
        Update: {
          age_category?: string | null
          break_note_en?: string | null
          break_note_ro?: string | null
          content?: Json
          course_type?: string
          created_at?: string
          days_of_week?: number[] | null
          duration_minutes?: number | null
          end_date?: string | null
          end_date_is_estimate?: boolean
          end_time?: string | null
          form_type?: string
          format?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          level?: string | null
          location_id?: string | null
          manual_offset?: number
          max_seats?: number
          price_lei?: number | null
          schedule_label_en?: string
          schedule_label_ro?: string
          session_count?: number | null
          slug?: string | null
          sort_order?: number
          start_date?: string
          start_time?: string | null
          status?: string
          teaching_language?: string
          timezone?: string
          title_en?: string | null
          title_ro?: string | null
          total_hours?: number | null
          track?: string
          tutor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_cohorts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_cohorts_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
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
      locations: {
        Row: {
          active: boolean
          address_en: string
          address_ro: string
          city: string
          created_at: string
          id: string
          map_url: string | null
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address_en: string
          address_ro: string
          city: string
          created_at?: string
          id?: string
          map_url?: string | null
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address_en?: string
          address_ro?: string
          city?: string
          created_at?: string
          id?: string
          map_url?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      manual_signups: {
        Row: {
          cohort_id: string | null
          count: number
          created_at: string
          form_type: string
          format: string | null
          id: string
          level: string | null
          note: string | null
          source: string
          updated_at: string
        }
        Insert: {
          cohort_id?: string | null
          count?: number
          created_at?: string
          form_type: string
          format?: string | null
          id?: string
          level?: string | null
          note?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          cohort_id?: string | null
          count?: number
          created_at?: string
          form_type?: string
          format?: string | null
          id?: string
          level?: string | null
          note?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_signups_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "group_cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      page_contents: {
        Row: {
          body_md: string
          faq: Json
          h1: string
          is_published: boolean
          lead: string
          meta_description: string
          meta_title: string
          path: string
          updated_at: string
        }
        Insert: {
          body_md?: string
          faq?: Json
          h1?: string
          is_published?: boolean
          lead?: string
          meta_description?: string
          meta_title?: string
          path: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          faq?: Json
          h1?: string
          is_published?: boolean
          lead?: string
          meta_description?: string
          meta_title?: string
          path?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_events: {
        Row: {
          bucket: string
          created_at: string
          id: number
        }
        Insert: {
          bucket: string
          created_at?: string
          id?: number
        }
        Update: {
          bucket?: string
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      registrations: {
        Row: {
          anonymized_at: string | null
          canceled_at: string | null
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
          language: string | null
          lead_status: string
          level: string | null
          months_paid: number
          months_total: number | null
          name: string
          notes: string | null
          paid_at: string | null
          payment_status: string
          phone: string
          quantity: number
          referral_code: string | null
          refund_reason: string | null
          refunded_amount: number | null
          refunded_at: string | null
          sms_confirmation_opt_in: boolean
          source: string
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          student_id: string | null
          subscription_status: string | null
          teaching_language: string | null
          track_preference: string | null
          whatsapp_sent_at: string | null
        }
        Insert: {
          anonymized_at?: string | null
          canceled_at?: string | null
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
          language?: string | null
          lead_status?: string
          level?: string | null
          months_paid?: number
          months_total?: number | null
          name: string
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          phone: string
          quantity?: number
          referral_code?: string | null
          refund_reason?: string | null
          refunded_amount?: number | null
          refunded_at?: string | null
          sms_confirmation_opt_in?: boolean
          source?: string
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          student_id?: string | null
          subscription_status?: string | null
          teaching_language?: string | null
          track_preference?: string | null
          whatsapp_sent_at?: string | null
        }
        Update: {
          anonymized_at?: string | null
          canceled_at?: string | null
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
          language?: string | null
          lead_status?: string
          level?: string | null
          months_paid?: number
          months_total?: number | null
          name?: string
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          phone?: string
          quantity?: number
          referral_code?: string | null
          refund_reason?: string | null
          refunded_amount?: number | null
          refunded_at?: string | null
          sms_confirmation_opt_in?: boolean
          source?: string
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          student_id?: string | null
          subscription_status?: string | null
          teaching_language?: string | null
          track_preference?: string | null
          whatsapp_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_leads: {
        Row: {
          consent: boolean
          created_at: string
          email: string
          id: string
          name: string | null
          resource: string
          source: string | null
        }
        Insert: {
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          name?: string | null
          resource?: string
          source?: string | null
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          resource?: string
          source?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          description_en: string
          description_ro: string
          email_template: string
          file_url: string
          is_active: boolean
          slug: string
          sort_order: number
          title_en: string
          title_ro: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_ro?: string
          email_template?: string
          file_url?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          title_en?: string
          title_ro?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_ro?: string
          email_template?: string
          file_url?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          title_en?: string
          title_ro?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_texts: {
        Row: {
          key: string
          updated_at: string
          value_en: string
          value_ro: string
        }
        Insert: {
          key: string
          updated_at?: string
          value_en?: string
          value_ro?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value_en?: string
          value_ro?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          id: string
          received_at: string
          registration_id: string | null
          summary: Json | null
          type: string
        }
        Insert: {
          id: string
          received_at?: string
          registration_id?: string | null
          summary?: Json | null
          type: string
        }
        Update: {
          id?: string
          received_at?: string
          registration_id?: string | null
          summary?: Json | null
          type?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          anonymized_at: string | null
          created_at: string
          email: string | null
          email_norm: string | null
          full_name: string
          id: string
          marketing_consent: boolean
          marketing_consent_at: string | null
          notes: string | null
          phone: string | null
          phone_norm: string | null
          preferred_language: string | null
          status: string
          updated_at: string
        }
        Insert: {
          anonymized_at?: string | null
          created_at?: string
          email?: string | null
          email_norm?: string | null
          full_name?: string
          id?: string
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          notes?: string | null
          phone?: string | null
          phone_norm?: string | null
          preferred_language?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          anonymized_at?: string | null
          created_at?: string
          email?: string | null
          email_norm?: string | null
          full_name?: string
          id?: string
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          notes?: string | null
          phone?: string | null
          phone_norm?: string | null
          preferred_language?: string | null
          status?: string
          updated_at?: string
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
      tutors: {
        Row: {
          active: boolean
          available_formats: string[]
          bio_en: string | null
          bio_ro: string | null
          created_at: string
          id: string
          languages: string[]
          name: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          available_formats?: string[]
          bio_en?: string | null
          bio_ro?: string | null
          created_at?: string
          id?: string
          languages?: string[]
          name: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          available_formats?: string[]
          bio_en?: string | null
          bio_ro?: string | null
          created_at?: string
          id?: string
          languages?: string[]
          name?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_record_rate_limit: {
        Args: { p_bucket: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      find_or_create_student: {
        Args: { p_email: string; p_name: string; p_phone: string }
        Returns: string
      }
      get_cohort_signup_counts: {
        Args: never
        Returns: {
          cohort_id: string
          taken: number
        }[]
      }
      get_group_capacity_counts: {
        Args: never
        Returns: {
          form_type: string
          format: string
          level: string
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
      student_name_key: { Args: { p_name: string }; Returns: string }
      student_names_match: {
        Args: { p_a: string; p_b: string }
        Returns: boolean
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
