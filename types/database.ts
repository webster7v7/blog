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
  }
}

