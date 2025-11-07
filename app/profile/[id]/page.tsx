import { createServerClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { FileText } from 'lucide-react';
import type { Metadata } from 'next';

// ⚡ 性能优化：启用页面缓存（5分钟）
export const revalidate = 300;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', id)
    .single();

  const username = (profile as any)?.username;

  return {
    title: username ? `${username} 的文章 | Webster` : '用户资料 | Webster',
    description: username ? `${username} 的发布文章` : '查看用户文章',
  };
}

export default async function ProfilePostsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  // 获取用户发布的文章
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    notFound();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        发布的文章
      </h2>
      
      {posts && posts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-gray-200/30 dark:border-gray-800/30">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            还没有发布任何文章
          </p>
        </div>
      )}
    </div>
  );
}

