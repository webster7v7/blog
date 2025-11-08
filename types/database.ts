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
      posts: {
        Row: {
          id: number
          title: string
          slug: string
          content: string
          excerpt: string | null
          published: boolean
          published_at: string
          views: number
          tags: string[] | null
          created_at: string
          updated_at: string
          author_id: string | null
          status: string | null
          likes_count: number | null
          favorites_count: number | null
          comments_count: number | null
          category: string | null
          cover_image: string | null
        }
        Insert: {
          id?: number
          title: string
          slug: string
          content: string
          excerpt?: string | null
          published?: boolean
          published_at?: string
          views?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          author_id?: string | null
          status?: string | null
          likes_count?: number | null
          favorites_count?: number | null
          comments_count?: number | null
          category?: string | null
          cover_image?: string | null
        }
        Update: {
          id?: number
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          published?: boolean
          published_at?: string
          views?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          author_id?: string | null
          status?: string | null
          likes_count?: number | null
          favorites_count?: number | null
          comments_count?: number | null
          category?: string | null
          cover_image?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          icon: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color: string
          icon?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string
          icon?: string | null
          order_index?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          bio: string | null
          website: string | null
          created_at: string
          updated_at: string
          role: string | null
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
          role?: string | null
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
          role?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          post_slug: string
          user_id: string
          parent_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_slug: string
          user_id: string
          parent_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_slug?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_slug: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_slug: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_slug?: string
          user_id?: string
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          post_slug: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_slug: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_slug?: string
          user_id?: string
          created_at?: string
        }
      }
      external_links: {
        Row: {
          id: string
          name: string
          url: string
          icon: string | null
          order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          icon?: string | null
          order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          icon?: string | null
          order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          category: 'miniprogram' | 'app' | 'webpage'
          icon: string | null
          file_url: string | null
          qr_code_url: string | null
          web_url: string | null
          tags: string[] | null
          downloads: number
          views: number
          is_published: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: 'miniprogram' | 'app' | 'webpage'
          icon?: string | null
          file_url?: string | null
          qr_code_url?: string | null
          web_url?: string | null
          tags?: string[] | null
          downloads?: number
          views?: number
          is_published?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: 'miniprogram' | 'app' | 'webpage'
          icon?: string | null
          file_url?: string | null
          qr_code_url?: string | null
          web_url?: string | null
          tags?: string[] | null
          downloads?: number
          views?: number
          is_published?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      personal_links: {
        Row: {
          id: string
          name: string
          icon: string
          url: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          url: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          url?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_stats: {
        Args: { user_uuid: string }
        Returns: {
          posts_count: number
          comments_count: number
          likes_count: number
          favorites_count: number
        }
      }
      get_user_profile_stats: {
        Args: { p_user_id: string }
        Returns: Array<{
          user_id: string
          username: string
          avatar_url: string | null
          bio: string | null
          website: string | null
          role: string | null
          created_at: string
          posts_count: number
          favorites_count: number
          likes_count: number
        }>
      }
      get_categories_with_count: {
        Args: Record<string, never>
        Returns: Array<{
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          icon: string | null
          order_index: number
          created_at: string
          posts_count: number
        }>
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

