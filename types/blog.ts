import type { Category } from './category';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  views: number;
  tags: string[];
  category: string | null;
  comments_count: number;
  likes_count: number;
  favorites_count: number;
}

export interface PostListItem extends Omit<Post, 'content'> {}

export interface PostWithCategory extends PostListItem {
  categoryData?: Category | null;
}

