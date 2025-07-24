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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_id: string | null
          activity_name: string
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          latitude: number | null
          location_name: string
          longitude: number | null
          notes: string | null
          scheduled_date: string
          scheduled_time: string
          status: string | null
          tour_assignment_id: string | null
          tour_guide_id: string | null
          tourist_id: string | null
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          activity_name: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          latitude?: number | null
          location_name: string
          longitude?: number | null
          notes?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string | null
          tour_assignment_id?: string | null
          tour_guide_id?: string | null
          tourist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          activity_name?: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
          tour_assignment_id?: string | null
          tour_guide_id?: string | null
          tourist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_tour_guide_id_fkey"
            columns: ["tour_guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_activities_tour_assignment_id_fkey"
            columns: ["tour_assignment_id"]
            isOneToOne: false
            referencedRelation: "tour_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          admin_role: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_role?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_role?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          country_code: string
          country_name_ar: string | null
          country_name_en: string
          created_at: string | null
          flag_emoji: string | null
          id: string
          is_active: boolean | null
          phone_code: string
          updated_at: string | null
        }
        Insert: {
          country_code: string
          country_name_ar?: string | null
          country_name_en: string
          created_at?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          phone_code: string
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          country_name_ar?: string | null
          country_name_en?: string
          created_at?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          phone_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          car_color: string | null
          car_model: string
          created_at: string
          created_by: string | null
          driver_id: string
          email: string
          id: string
          license_number: string
          name: string
          phone: string
          plate_number: string
          rating: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          car_color?: string | null
          car_model: string
          created_at?: string
          created_by?: string | null
          driver_id: string
          email: string
          id?: string
          license_number: string
          name: string
          phone: string
          plate_number: string
          rating?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          car_color?: string | null
          car_model?: string
          created_at?: string
          created_by?: string | null
          driver_id?: string
          email?: string
          id?: string
          license_number?: string
          name?: string
          phone?: string
          plate_number?: string
          rating?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      guide_ratings: {
        Row: {
          comment: string | null
          created_at: string
          guide_id: string
          id: string
          rating: number
          tour_assignment_id: string | null
          tourist_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          guide_id: string
          id?: string
          rating: number
          tour_assignment_id?: string | null
          tourist_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          guide_id?: string
          id?: string
          rating?: number
          tour_assignment_id?: string | null
          tourist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_ratings_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_ratings_tour_assignment_id_fkey"
            columns: ["tour_assignment_id"]
            isOneToOne: false
            referencedRelation: "tour_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_requests: {
        Row: {
          admin_response: string | null
          adults_count: number | null
          assigned_guide_id: string | null
          children_count: number | null
          created_at: string | null
          id: string
          request_message: string | null
          status: string | null
          tourist_id: string
          updated_at: string | null
        }
        Insert: {
          admin_response?: string | null
          adults_count?: number | null
          assigned_guide_id?: string | null
          children_count?: number | null
          created_at?: string | null
          id?: string
          request_message?: string | null
          status?: string | null
          tourist_id: string
          updated_at?: string | null
        }
        Update: {
          admin_response?: string | null
          adults_count?: number | null
          assigned_guide_id?: string | null
          children_count?: number | null
          created_at?: string | null
          id?: string
          request_message?: string | null
          status?: string | null
          tourist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_requests_assigned_guide_id_fkey"
            columns: ["assigned_guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_requests_tourist_id_fkey"
            columns: ["tourist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          availability_status: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          email: string
          experience_years: number | null
          guide_id: string
          hourly_rate: number | null
          id: string
          languages: string[] | null
          location: string | null
          name: string
          password: string
          phone: string
          rating: number | null
          specializations: string[] | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          availability_status?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          email: string
          experience_years?: number | null
          guide_id: string
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          location?: string | null
          name: string
          password: string
          phone: string
          rating?: number | null
          specializations?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_status?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          email?: string
          experience_years?: number | null
          guide_id?: string
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          location?: string | null
          name?: string
          password?: string
          phone?: string
          rating?: number | null
          specializations?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message_text: string
          message_type: string | null
          metadata: Json | null
          recipient_id: string | null
          sender_id: string | null
          tour_assignment_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_text: string
          message_type?: string | null
          metadata?: Json | null
          recipient_id?: string | null
          sender_id?: string | null
          tour_assignment_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_text?: string
          message_type?: string | null
          metadata?: Json | null
          recipient_id?: string | null
          sender_id?: string | null
          tour_assignment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tour_assignment_id_fkey"
            columns: ["tour_assignment_id"]
            isOneToOne: false
            referencedRelation: "tour_assignments"
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
          notification_type: string
          related_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          related_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          related_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_hours: number | null
          id: string
          included_activities: string[] | null
          max_participants: number | null
          package_name: string
          price: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          id?: string
          included_activities?: string[] | null
          max_participants?: number | null
          package_name: string
          price?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          id?: string
          included_activities?: string[] | null
          max_participants?: number | null
          package_name?: string
          price?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      photo_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          photo_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          photo_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          photo_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_comments_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "tourist_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          contact_info: string | null
          created_at: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          nationality: string | null
          phone_number: string | null
          special_needs: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          contact_info?: string | null
          created_at?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_active?: boolean | null
          nationality?: string | null
          phone_number?: string | null
          special_needs?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          avatar_url?: string | null
          contact_info?: string | null
          created_at?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          nationality?: string | null
          phone_number?: string | null
          special_needs?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      reschedule_requests: {
        Row: {
          created_at: string | null
          guide_id: string | null
          id: string
          location_name: string | null
          original_date: string
          original_time: string
          reason: string | null
          requested_date: string
          requested_time: string
          response_message: string | null
          status: string | null
          tour_assignment_id: string | null
          tourist_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guide_id?: string | null
          id?: string
          location_name?: string | null
          original_date: string
          original_time: string
          reason?: string | null
          requested_date: string
          requested_time: string
          response_message?: string | null
          status?: string | null
          tour_assignment_id?: string | null
          tourist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guide_id?: string | null
          id?: string
          location_name?: string | null
          original_date?: string
          original_time?: string
          reason?: string | null
          requested_date?: string
          requested_time?: string
          response_message?: string | null
          status?: string | null
          tour_assignment_id?: string | null
          tourist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reschedule_requests_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_requests_tour_assignment_id_fkey"
            columns: ["tour_assignment_id"]
            isOneToOne: false
            referencedRelation: "tour_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_requests_tourist_id_fkey"
            columns: ["tourist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_assignments: {
        Row: {
          created_at: string | null
          end_date: string | null
          guide_id: string | null
          id: string
          start_date: string | null
          status: string | null
          tour_name: string
          tourist_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          guide_id?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          tour_name: string
          tourist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          guide_id?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          tour_name?: string
          tourist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_assignments_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_assignments_tourist_id_fkey"
            columns: ["tourist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tourist_experiences: {
        Row: {
          comment: string
          created_at: string
          destinations: string[] | null
          id: string
          location_name: string | null
          photo_id: string
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          destinations?: string[] | null
          id?: string
          location_name?: string | null
          photo_id: string
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          destinations?: string[] | null
          id?: string
          location_name?: string | null
          photo_id?: string
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tourist_experiences_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "tourist_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      tourist_photos: {
        Row: {
          caption: string | null
          content_type: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          share_with_world: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          content_type?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          share_with_world?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          content_type?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          share_with_world?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          accuracy: number | null
          id: string
          is_current: boolean | null
          latitude: number
          longitude: number
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          id?: string
          is_current?: boolean | null
          latitude: number
          longitude: number
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          id?: string
          is_current?: boolean | null
          latitude?: number
          longitude?: number
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
