import { createServerClient, createPublicClient } from './supabase';
import { Post, PostListItem, PostWithCategory } from '@/types/blog';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { CACHE_STATIC_CONTENT, CACHE_LIST_DATA, CACHE_TAGS } from './cache';
import { getCachedCategories } from './categories';

// ==================== React cache 请求去重 ====================
// 用于同一渲染周期内避免重复查询

export const getAllPosts = cache(async (): Promise<PostListItem[]> => {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, views, tags, category, comments_count, likes_count, favorites_count')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data as PostListItem[];
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('*, comments_count, likes_count, favorites_count')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return data as Post;
});

export const getAllTags = cache(async (): Promise<Array<{ name: string; count: number }>> => {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('tags')
    .eq('published', true);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  const tagCount = new Map<string, number>();
  data.forEach((post: { tags: string[] }) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    }
  });

  return Array.from(tagCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

export const getPostsByTag = cache(async (tag: string): Promise<PostListItem[]> => {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, views, tags, category, comments_count, likes_count, favorites_count')
    .eq('published', true)
    .contains('tags', [tag])
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }

  return data as PostListItem[];
});

/**
 * 优化的getAdjacentPosts - 使用单次查询获取相邻文章
 * 原实现：3次数据库查询（当前文章 + 上一篇 + 下一篇）
 * 新实现：1次查询获取所有数据，在内存中筛选
 */
export const getAdjacentPosts = cache(async (currentSlug: string): Promise<{
  prev: PostListItem | null;
  next: PostListItem | null;
}> => {
  const supabase = await createServerClient();
  
  // 一次性获取当前文章和所有已发布文章的时间戳信息
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, views, tags')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error || !posts || posts.length === 0) {
    return { prev: null, next: null };
  }

  // 在内存中查找当前文章的索引
  const currentIndex = posts.findIndex(post => post.slug === currentSlug);
  
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  // 上一篇：在数组中的下一个位置（时间更早）
  const prev = currentIndex < posts.length - 1 ? posts[currentIndex + 1] as PostListItem : null;
  
  // 下一篇：在数组中的上一个位置（时间更晚）
  const next = currentIndex > 0 ? posts[currentIndex - 1] as PostListItem : null;

  return { prev, next };
});

export const getPostsByMonth = cache(async (): Promise<{
  [year: string]: {
    [month: string]: PostListItem[];
  };
}> => {
  const posts = await getAllPosts();
  const grouped: { [year: string]: { [month: string]: PostListItem[] } } = {};

  posts.forEach((post) => {
    const date = new Date(post.published_at);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][month]) {
      grouped[year][month] = [];
    }
    grouped[year][month].push(post);
  });

  return grouped;
});

export const getTagsWithCount = cache(async (): Promise<Array<{ tag: string; count: number }>> => {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('tags')
    .eq('published', true);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  const tagCount = new Map<string, number>();
  data.forEach((post: { tags: string[] }) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    }
  });

  return Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
});

// ==================== unstable_cache 服务端缓存 ====================
// 用于跨请求的数据缓存，减少数据库查询

/**
 * 缓存版本：获取文章列表（不含统计数据）
 * 缓存时间：5分钟
 * 标签：posts（可用于按需失效）
 */
export const getCachedPostsList = unstable_cache(
  async (): Promise<PostListItem[]> => {
    const supabase = createPublicClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, tags, category')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching cached posts:', error);
      return [];
    }

    return data as PostListItem[];
  },
  ['posts-list'],
  { revalidate: CACHE_LIST_DATA, tags: [CACHE_TAGS.POSTS] }
);

/**
 * 获取文章列表及其完整的分类数据
 * 通过批量获取并在内存中关联，避免N次独立请求
 */
export async function getPostsWithCategories(): Promise<PostWithCategory[]> {
  // 获取缓存的文章列表
  const posts = await getCachedPostsList();
  
  // 如果没有文章，直接返回
  if (posts.length === 0) {
    return [];
  }
  
  // 提取所有唯一的category IDs（过滤null值）
  const categoryIds = [...new Set(
    posts
      .map(post => post.category)
      .filter((id): id is string => id !== null)
  )];
  
  // 如果没有分类，直接返回文章列表
  if (categoryIds.length === 0) {
    return posts.map(post => ({ ...post, categoryData: null }));
  }
  
  // 获取缓存的所有分类数据
  const allCategories = await getCachedCategories();
  
  // 创建分类ID到分类对象的映射
  const categoryMap = new Map(
    allCategories.map(cat => [cat.id, cat])
  );
  
  // 关联文章和分类数据
  return posts.map(post => ({
    ...post,
    categoryData: post.category ? categoryMap.get(post.category) || null : null,
  }));
}

/**
 * 获取文章的动态统计数据（不缓存）
 * 包括：views, likes_count, favorites_count, comments_count
 */
export async function getPostsStats(): Promise<Map<string, {
  views: number;
  likes_count: number;
  favorites_count: number;
  comments_count: number;
}>> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('slug, views, likes_count, favorites_count, comments_count')
    .eq('published', true);

  if (error) {
    console.error('Error fetching post stats:', error);
    return new Map();
  }

  const statsMap = new Map();
  data?.forEach((post: any) => {
    statsMap.set(post.slug, {
      views: post.views || 0,
      likes_count: post.likes_count || 0,
      favorites_count: post.favorites_count || 0,
      comments_count: post.comments_count || 0,
    });
  });

  return statsMap;
}

/**
 * 缓存版本：获取单篇文章内容（不含动态统计）
 * 缓存时间：1小时
 * 标签：posts
 */
export const getCachedPostContent = unstable_cache(
  async (slug: string): Promise<Omit<Post, 'views' | 'likes_count' | 'favorites_count' | 'comments_count'> | null> => {
    const supabase = createPublicClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, content, excerpt, cover_image, published, published_at, created_at, updated_at, tags, category')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      console.error('Error fetching cached post content:', error);
      return null;
    }

    return data as Omit<Post, 'views' | 'likes_count' | 'favorites_count' | 'comments_count'>;
  },
  ['post-content'],
  { revalidate: CACHE_STATIC_CONTENT, tags: [CACHE_TAGS.POSTS] }
);

/**
 * 获取单篇文章的动态统计（不缓存）
 */
export async function getPostStats(slug: string): Promise<{
  views: number;
  likes_count: number;
  favorites_count: number;
  comments_count: number;
} | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('views, likes_count, favorites_count, comments_count')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching post stats:', error);
    return null;
  }

  return {
    views: data.views || 0,
    likes_count: data.likes_count || 0,
    favorites_count: data.favorites_count || 0,
    comments_count: data.comments_count || 0,
  };
}

/**
 * 缓存版本：获取所有标签及统计
 * 缓存时间：10分钟
 */
export const getCachedTags = unstable_cache(
  async (): Promise<Array<{ name: string; count: number }>> => {
    const supabase = createPublicClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select('tags')
      .eq('published', true);

    if (error) {
      console.error('Error fetching cached tags:', error);
      return [];
    }

    const tagCount = new Map<string, number>();
    data.forEach((post: { tags: string[] }) => {
      if (post.tags) {
        post.tags.forEach((tag) => {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        });
      }
    });

    return Array.from(tagCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },
  ['tags-list'],
  { revalidate: CACHE_LIST_DATA, tags: [CACHE_TAGS.TAGS, CACHE_TAGS.POSTS] }
);

