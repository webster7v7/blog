// Personal Links types
export interface PersonalLink {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  url: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePersonalLinkInput {
  name: string;
  icon: string;
  url: string;
  description?: string;
  order_index?: number;
}

export interface UpdatePersonalLinkInput {
  name?: string;
  icon?: string;
  url?: string;
  description?: string;
  order_index?: number;
}

// Projects types
export type ProjectCategory = 'miniprogram' | 'app' | 'webpage';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  category: ProjectCategory;
  icon: string | null;
  file_url: string | null; // Download link for app/file
  qr_code_url: string | null; // WeChat QR code
  web_url: string | null; // Website link
  tags: string[] | null;
  downloads: number;
  views: number;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  category: ProjectCategory;
  icon?: string;
  file_url?: string;
  qr_code_url?: string;
  web_url?: string;
  tags?: string[];
  is_published?: boolean;
  order_index?: number;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  category?: ProjectCategory;
  icon?: string;
  file_url?: string;
  qr_code_url?: string;
  web_url?: string;
  tags?: string[];
  is_published?: boolean;
  order_index?: number;
}

export const PROJECT_CATEGORIES = {
  miniprogram: { label: '小程序', icon: 'Smartphone' },
  app: { label: 'APP', icon: 'AppWindow' },
  webpage: { label: '网页', icon: 'Globe' }
} as const;

