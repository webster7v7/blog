import { Post, PostListItem } from '@/types/blog';

/**
 * 搜索文章（title, excerpt, tags）
 * ✅ 优化：移除 content 字段搜索，减少数据加载
 */
export function searchPosts(query: string, posts: Post[] | PostListItem[]): PostListItem[] {
  if (!query.trim()) {
    return posts as PostListItem[];
  }

  const lowerQuery = query.toLowerCase();

  return posts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(lowerQuery);
    const excerptMatch = post.excerpt?.toLowerCase().includes(lowerQuery);
    const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
    
    // ✅ 移除 contentMatch，避免加载完整文章内容
    return titleMatch || excerptMatch || tagsMatch;
  }) as PostListItem[];
}

