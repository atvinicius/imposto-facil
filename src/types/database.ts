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
          faturamento: string | null
          simulator_result: Json | null
          diagnostico_purchased_at: string | null
          subscription_tier: string
          stripe_customer_id: string | null
          checklist_progress: Json | null
          // Deep personalization (migration 00005)
          fator_r_estimado: number | null
          pct_b2b: number | null
          tipo_custo_principal: string | null
          pct_interestadual: number | null
          tem_incentivo_icms: string | null
          num_funcionarios: string | null
          exporta_servicos: boolean | null
          mix_pix: number | null
          mix_cartao: number | null
          mix_boleto: number | null
          mix_dinheiro: number | null
          fornecedores_regime: string | null
          tem_contratos_lp: boolean | null
          importa_bens: boolean | null
          imovel_proprio: boolean | null
          faturamento_exato: number | null
          cnae_principal: string | null
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
          faturamento?: string | null
          simulator_result?: Json | null
          diagnostico_purchased_at?: string | null
          subscription_tier?: string
          stripe_customer_id?: string | null
          checklist_progress?: Json | null
          fator_r_estimado?: number | null
          pct_b2b?: number | null
          tipo_custo_principal?: string | null
          pct_interestadual?: number | null
          tem_incentivo_icms?: string | null
          num_funcionarios?: string | null
          exporta_servicos?: boolean | null
          mix_pix?: number | null
          mix_cartao?: number | null
          mix_boleto?: number | null
          mix_dinheiro?: number | null
          fornecedores_regime?: string | null
          tem_contratos_lp?: boolean | null
          importa_bens?: boolean | null
          imovel_proprio?: boolean | null
          faturamento_exato?: number | null
          cnae_principal?: string | null
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
          faturamento?: string | null
          simulator_result?: Json | null
          diagnostico_purchased_at?: string | null
          subscription_tier?: string
          stripe_customer_id?: string | null
          checklist_progress?: Json | null
          fator_r_estimado?: number | null
          pct_b2b?: number | null
          tipo_custo_principal?: string | null
          pct_interestadual?: number | null
          tem_incentivo_icms?: string | null
          num_funcionarios?: string | null
          exporta_servicos?: boolean | null
          mix_pix?: number | null
          mix_cartao?: number | null
          mix_boleto?: number | null
          mix_dinheiro?: number | null
          fornecedores_regime?: string | null
          tem_contratos_lp?: boolean | null
          importa_bens?: boolean | null
          imovel_proprio?: boolean | null
          faturamento_exato?: number | null
          cnae_principal?: string | null
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
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          event_name: string
          properties: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id: string
          event_name: string
          properties?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          event_name?: string
          properties?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          unsubscribed_at: string | null
          source: string
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          source: string
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          source?: string
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
