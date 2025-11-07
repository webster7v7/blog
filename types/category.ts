export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  order_index: number;
  posts_count?: number;
  created_at: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  order_index: number;
}

