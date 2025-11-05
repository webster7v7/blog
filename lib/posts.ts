import { createServerClient } from './supabase';
import { Post, PostListItem } from '@/types/blog';

export async function getAllPosts(): Promise<PostListItem[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, views, tags')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data as PostListItem[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
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
}

export async function getAllTags(): Promise<Array<{ name: string; count: number }>> {
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
}

export async function getPostsByTag(tag: string): Promise<PostListItem[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, views, tags')
    .eq('published', true)
    .contains('tags', [tag])
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }

  return data as PostListItem[];
}

export async function getAdjacentPosts(currentSlug: string): Promise<{
  prev: PostListItem | null;
  next: PostListItem | null;
}> {
  const supabase = await createServerClient();
  
  // 获取当前文章
  const { data: currentPost } = await supabase
    .from('posts')
    .select('published_at')
    .eq('slug', currentSlug)
    .eq('published', true)
    .single();

  if (!currentPost) {
    return { prev: null, next: null };
  }

  // 获取上一篇（发布时间更早）
  const { data: prevPost } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, views, tags')
    .eq('published', true)
    .lt('published_at', currentPost.published_at)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  // 获取下一篇（发布时间更晚）
  const { data: nextPost } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, views, tags')
    .eq('published', true)
    .gt('published_at', currentPost.published_at)
    .order('published_at', { ascending: true })
    .limit(1)
    .single();

  return {
    prev: prevPost as PostListItem | null,
    next: nextPost as PostListItem | null,
  };
}

export async function getPostsByMonth(): Promise<{
  [year: string]: {
    [month: string]: PostListItem[];
  };
}> {
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
}

export async function getTagsWithCount(): Promise<Array<{ tag: string; count: number }>> {
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
}

