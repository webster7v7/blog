import { Category } from './category';

export interface HtmlModule {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  category_id: string | null;
  tags: string[] | null;
  link_type: 'modal' | 'page' | 'external';
  external_url: string | null;
  cover_image: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface HtmlModuleWithCategory extends HtmlModule {
  categoryData?: Category | null;
}

export interface HtmlModuleFormData {
  title: string;
  slug: string;
  description: string;
  content: string;
  category_id: string | null;
  tags: string[];
  link_type: 'modal' | 'page' | 'external';
  external_url: string | null;
  cover_image: string | null;
  is_active: boolean;
  order_index: number;
}
