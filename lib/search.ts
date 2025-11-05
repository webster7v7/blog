import { Post, PostListItem } from '@/types/blog';

export function searchPosts(query: string, posts: Post[] | PostListItem[]): PostListItem[] {
  if (!query.trim()) {
    return posts as PostListItem[];
  }

  const lowerQuery = query.toLowerCase();

  return posts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(lowerQuery);
    const excerptMatch = post.excerpt?.toLowerCase().includes(lowerQuery);
    const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
    const contentMatch = 'content' in post && typeof post.content === 'string' && post.content.toLowerCase().includes(lowerQuery);

    return titleMatch || excerptMatch || tagsMatch || contentMatch;
  }) as PostListItem[];
}

