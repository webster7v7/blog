import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Users as UsersIcon, Calendar, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import RoleSelector from '@/components/admin/RoleSelector';
import UserStatsCard from '@/components/admin/UserStatsCard';
import Pagination from '@/components/admin/Pagination';

interface SearchParams {
  page?: string;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();

  // 检查用户是否登录
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/?redirect=/admin/users');
  }

  // 检查是否是管理员
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  // 分页参数
  const page = Number(params.page) || 1;
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 获取用户（带分页）
  const { data: profiles, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // 计算总页数
  const totalPages = Math.ceil((count || 0) / pageSize);

  // 批量获取当前页用户的统计信息（优化：只查询当前页）
  const profileIds = (profiles || []).map(p => p.id);
  
  // 并发获取所有统计数据
  const statsResults = await Promise.all(
    profileIds.map(id => 
      supabase.rpc('get_user_stats', { user_uuid: id })
    )
  );

  // 创建统计数据映射表
  const statsMap = new Map(
    statsResults.map((result, index) => [
      profileIds[index],
      result.data?.[0] || {
        posts_count: 0,
        comments_count: 0,
        likes_received: 0,
        favorites_received: 0,
      }
    ])
  );

  // 组合用户和统计数据
  const usersWithStats = (profiles || []).map(userProfile => ({
    ...userProfile,
    stats: statsMap.get(userProfile.id) || {
      posts_count: 0,
      comments_count: 0,
      likes_received: 0,
      favorites_received: 0,
    },
  }));

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            用户管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理所有注册用户和权限
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-lg backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-gray-200/30 dark:border-gray-800/30">
          <UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {usersWithStats.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">总用户数</p>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/30 dark:border-gray-800/30 overflow-hidden">
        {usersWithStats && usersWithStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/30 dark:border-gray-800/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    用户
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    统计信息
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    注册时间
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30 dark:divide-gray-800/30">
                {usersWithStats.map((userProfile) => (
                  <tr
                    key={userProfile.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* 头像 */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                          {userProfile.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {/* 用户信息 */}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {userProfile.username}
                            {userProfile.id === user.id && (
                              <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                                (你)
                              </span>
                            )}
                          </p>
                          {userProfile.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                              {userProfile.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleSelector
                        userId={userProfile.id}
                        currentRole={userProfile.role || 'user'}
                        username={userProfile.username}
                        isCurrentUser={userProfile.id === user.id}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <UserStatsCard stats={userProfile.stats} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(
                            new Date(userProfile.created_at),
                            'yyyy-MM-dd',
                            {
                              locale: zhCN,
                            }
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">暂无用户数据</p>
          </div>
        )}

        {/* 分页 */}
        {usersWithStats && usersWithStats.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/admin/users"
          />
        )}
      </div>
    </div>
  );
}

