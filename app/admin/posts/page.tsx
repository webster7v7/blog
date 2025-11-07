import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import PostsFilter from '@/components/admin/PostsFilter';
import PostsList from '@/components/admin/PostsList';
import Pagination from '@/components/admin/Pagination';

// ✅ 优化：添加页面级缓存
// 30秒缓存，平衡数据新鲜度和性能
export const revalidate = 30;

interface SearchParams {
  search?: string;
  status?: string;
  sort?: string;
  page?: string;
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();

  // 分页参数
  const page = Number(params.page) || 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 构建查询
  let query = supabase.from('posts').select('*', { count: 'exact' });

  // 搜索筛选
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,tags.cs.{${params.search}}`);
  }

  // 状态筛选
  if (params.status === 'published') {
    query = query.eq('status', 'published');
  } else if (params.status === 'draft') {
    query = query.eq('status', 'draft');
  }

  // 排序
  switch (params.sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'views':
      query = query.order('views', { ascending: false });
      break;
    case 'comments':
      query = query.order('comments_count', { ascending: false });
      break;
    default: // newest
      query = query.order('created_at', { ascending: false });
  }

  // 应用分页
  const { data: posts, count } = await query.range(from, to);

  // 计算总页数
  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            文章管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理你的所有文章
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>新建文章</span>
        </Link>
      </div>

      {/* 筛选器 */}
      <PostsFilter />

      {/* 文章列表 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/30 dark:border-gray-800/30 overflow-hidden">
        {posts && posts.length > 0 ? (
          <>
            <PostsList posts={posts} />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/admin/posts"
            />
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              还没有文章，开始写第一篇吧！
            </p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>新建文章</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

