import { createServerClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PostEditor from '@/components/admin/PostEditor';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerClient();

  // 获取文章数据
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  // 处理错误或文章不存在
  if (error || !post) {
    notFound();
  }

  // 准备 initialData
  const initialData = {
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt || '',
    tags: post.tags || [],
    category: post.category || '',
    status: post.status || 'draft',
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/posts"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            编辑文章
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {post.title}
          </p>
        </div>
      </div>

      {/* 编辑器 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
        <PostEditor mode="edit" initialData={initialData} />
      </div>
    </div>
  );
}

