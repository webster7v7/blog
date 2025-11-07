'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import DeletePostButton from '@/components/admin/DeletePostButton';
import BatchActions from '@/components/admin/BatchActions';

interface Post {
  id: number;
  title: string;
  slug: string;
  status: string | null;
  views: number;
  comments_count: number | null;
  created_at: string;
  tags: string[] | null;
}

interface PostsListProps {
  posts: Post[];
}

export default function PostsList({ posts }: PostsListProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSlugs(posts.map((post) => post.slug));
    } else {
      setSelectedSlugs([]);
    }
  };

  const handleSelectPost = (slug: string, checked: boolean) => {
    if (checked) {
      setSelectedSlugs([...selectedSlugs, slug]);
    } else {
      setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    }
  };

  const isAllSelected = posts.length > 0 && selectedSlugs.length === posts.length;
  const isSomeSelected = selectedSlugs.length > 0 && selectedSlugs.length < posts.length;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/30 dark:border-gray-800/30">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                标题
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                浏览量
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                评论
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/30 dark:divide-gray-800/30">
            {posts.map((post) => (
              <tr
                key={post.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                  selectedSlugs.includes(post.slug) ? 'bg-purple-50 dark:bg-purple-900/10' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedSlugs.includes(post.slug)}
                    onChange={(e) => handleSelectPost(post.slug, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="font-medium text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {post.title}
                    </Link>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}
                  >
                    {post.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.views || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {post.comments_count || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(post.created_at), 'yyyy-MM-dd', {
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/posts/${post.slug}/edit`}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <DeletePostButton slug={post.slug} title={post.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 批量操作工具栏 */}
      <BatchActions
        selectedSlugs={selectedSlugs}
        onClearSelection={() => setSelectedSlugs([])}
        onSuccess={() => setSelectedSlugs([])}
      />
    </>
  );
}

