import PostEditor from '@/components/admin/PostEditor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPostPage() {
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
            新建文章
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            创建一篇新的博客文章
          </p>
        </div>
      </div>

      {/* 编辑器 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
        <PostEditor mode="create" />
      </div>
    </div>
  );
}

