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
      conversations: {
        Row: {
          agent_used: Database["public"]["Enums"]["agent_type"] | null
          created_at: string
          id: string
          message: string
          role: Database["public"]["Enums"]["message_role"]
          user_id: string
        }
        Insert: {
          agent_used?: Database["public"]["Enums"]["agent_type"] | null
          created_at?: string
          id?: string
          message: string
          role: Database["public"]["Enums"]["message_role"]
          user_id: string
        }
        Update: {
          agent_used?: Database["public"]["Enums"]["agent_type"] | null
          created_at?: string
          id?: string
          message?: string
          role?: Database["public"]["Enums"]["message_role"]
          user_id?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["listing_category"]
          city: string | null
          created_at: string
          description: string
          id: string
          level: string | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          price: number | null
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          active?: boolean
          category: Database["public"]["Enums"]["listing_category"]
          city?: string | null
          created_at?: string
          description: string
          id?: string
          level?: string | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          price?: number | null
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["listing_category"]
          city?: string | null
          created_at?: string
          description?: string
          id?: string
          level?: string | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          price?: number | null
          subject?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          listing_id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          listing_id: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          listing_id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          language: string | null
          name: string
          profile_type: Database["public"]["Enums"]["profile_type"] | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id: string
          language?: string | null
          name?: string
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          language?: string | null
          name?: string
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          reason: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          reason: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          budget: string | null
          family_status: string | null
          interests: string[] | null
          travel_style: string | null
          traveler_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: string | null
          family_status?: string | null
          interests?: string[] | null
          travel_style?: string | null
          traveler_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: string | null
          family_status?: string | null
          interests?: string[] | null
          travel_style?: string | null
          traveler_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_ratings: {
        Row: {
          avg_rating: number | null
          review_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agent_type:
        | "administratif"
        | "sante"
        | "voyage"
        | "services_locaux"
        | "commerce_international"
        | "apprentissage"
        | "general"
      listing_category:
        | "Administratif"
        | "Santé"
        | "Voyage"
        | "Services Locaux"
        | "Commerce International"
        | "Apprentissage"
      listing_type: "Vente" | "Location" | "Covoiturage" | "Service" | "Tutorat"
      message_role: "user" | "assistant"
      profile_type:
        | "particulier"
        | "etudiant"
        | "auto_entrepreneur"
        | "retraite"
        | "etranger"
        | "parent"
        | "aidant"
        | "senior"
        | "professionnel"
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
      agent_type: [
        "administratif",
        "sante",
        "voyage",
        "services_locaux",
        "commerce_international",
        "apprentissage",
        "general",
      ],
      listing_category: [
        "Administratif",
        "Santé",
        "Voyage",
        "Services Locaux",
        "Commerce International",
        "Apprentissage",
      ],
      listing_type: ["Vente", "Location", "Covoiturage", "Service", "Tutorat"],
      message_role: ["user", "assistant"],
      profile_type: [
        "particulier",
        "etudiant",
        "auto_entrepreneur",
        "retraite",
        "etranger",
        "parent",
        "aidant",
        "senior",
        "professionnel",
      ],
    },
  },
} as const
