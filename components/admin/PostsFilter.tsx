'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';

export default function PostsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setStatus(searchParams.get('status') || 'all');
    setSort(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  const handleFilter = () => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    if (sort !== 'newest') params.set('sort', sort);
    
    const queryString = params.toString();
    router.push(`/admin/posts${queryString ? `?${queryString}` : ''}`);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setSort('newest');
    router.push('/admin/posts');
  };

  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          筛选文章
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 搜索框 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            搜索标题或标签
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              placeholder="输入关键词..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* 状态筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            文章状态
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="all">全部</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
        </div>

        {/* 排序方式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            排序方式
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="newest">最新发布</option>
            <option value="oldest">最早发布</option>
            <option value="views">浏览最多</option>
            <option value="comments">评论最多</option>
          </select>
        </div>
      </div>

      {/* 按钮 */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleFilter}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
        >
          应用筛选
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
        >
          重置
        </button>
      </div>
    </div>
  );
}

