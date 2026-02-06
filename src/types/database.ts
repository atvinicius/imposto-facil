export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          nome: string | null
          uf: string | null
          setor: string | null
          porte_empresa: string | null
          nivel_experiencia: string | null
          regime_tributario: string | null
          interesses: string[] | null
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nome?: string | null
          uf?: string | null
          setor?: string | null
          porte_empresa?: string | null
          nivel_experiencia?: string | null
          regime_tributario?: string | null
          interesses?: string[] | null
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string | null
          uf?: string | null
          setor?: string | null
          porte_empresa?: string | null
          nivel_experiencia?: string | null
          regime_tributario?: string | null
          interesses?: string[] | null
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          context_snapshot: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          context_snapshot?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          context_snapshot?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: "user" | "assistant"
          content: string
          sources: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: "user" | "assistant"
          content: string
          sources?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: "user" | "assistant"
          content?: string
          sources?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      content_chunks: {
        Row: {
          id: string
          source_path: string
          title: string
          section_title: string | null
          category: string
          content: string
          chunk_index: number
          source_hash: string | null
          difficulty: "basico" | "intermediario" | "avancado"
          embedding: number[] | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_path: string
          title: string
          section_title?: string | null
          category: string
          content: string
          chunk_index?: number
          source_hash?: string | null
          difficulty?: "basico" | "intermediario" | "avancado"
          embedding?: number[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_path?: string
          title?: string
          section_title?: string | null
          category?: string
          content?: string
          chunk_index?: number
          source_hash?: string | null
          difficulty?: "basico" | "intermediario" | "avancado"
          embedding?: number[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_content_chunks: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
          filter_category?: string | null
          filter_difficulty?: string | null
        }
        Returns: {
          id: string
          source_path: string
          title: string
          section_title: string | null
          category: string
          content: string
          similarity: number
          difficulty: string
          metadata: Json | null
        }[]
      }
      search_content: {
        Args: {
          search_query: string
          filter_category?: string | null
          filter_difficulty?: string | null
        }
        Returns: {
          id: string
          source_path: string
          title: string
          section_title: string | null
          category: string
          content: string
          rank: number
          difficulty: string
          metadata: Json | null
        }[]
      }
      get_content_stats: {
        Args: Record<string, never>
        Returns: {
          category: string
          chunk_count: number
          article_count: number
          avg_similarity: number
        }[]
      }
      find_related_content: {
        Args: {
          chunk_id: string
          match_count?: number
        }
        Returns: {
          id: string
          source_path: string
          title: string
          category: string
          similarity: number
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

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
