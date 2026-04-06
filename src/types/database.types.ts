export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          price: number
          image: string
          category: string
          description: string | null
          is_vintage: boolean
          name_description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          price: number
          image: string
          category: string
          description?: string | null
          is_vintage?: boolean
          name_description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          price?: number
          image?: string
          category?: string
          description?: string | null
          is_vintage?: boolean
          name_description?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          total: number
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          total: number
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          total?: number
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
        }
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      cart_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          product_id: string
          quantity: number
          selected_size: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          product_id: string
          quantity?: number
          selected_size?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          product_id?: string
          quantity?: number
          selected_size?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cart_items_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cart_items_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_total_revenue: {
        Args: Record<string, never>
        Returns: { total: number }[]
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
