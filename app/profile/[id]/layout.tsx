import { createServerClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { FileText, Heart, Star, Calendar, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getCachedUserProfile } from '@/lib/profile-cache';

// ⚡ 性能优化：启用页面缓存（5分钟）
export const revalidate = 300;

interface LayoutProps {
  children: ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfileLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  
  // ⚡ 性能优化：使用 RPC 函数一次性获取所有数据
  // 优化前：5 次串行查询（约 1000ms）
  // 优化后：1 次 RPC 调用（约 200ms）
  const profileData = await getCachedUserProfile(id);

  if (!profileData || !profileData.profile) {
    notFound();
  }

  const { profile, posts_count, favorites_count, likes_count } = profileData;

  // 检查当前用户
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === id;

  // 生成头像（使用首字母）
  const avatarLetter = profile.username.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* 用户资料卡片 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* 头像 */}
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {avatarLetter}
            </div>
          )}

          {/* 用户信息 */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {profile.username}
              {isOwnProfile && (
                <span className="ml-2 text-sm font-normal text-purple-600 dark:text-purple-400">
                  (我)
                </span>
              )}
            </h1>

            {profile.bio && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600 dark:text-gray-400">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>网站</span>
                </a>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  加入于 {format(new Date(profile.created_at), 'yyyy年MM月', { locale: zhCN })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="mt-6 pt-6 border-t border-gray-200/30 dark:border-gray-800/30">
          <nav className="flex flex-wrap gap-2">
            <Link
              href={`/profile/${id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">文章</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {posts_count || 0}
              </span>
            </Link>

            {/* 只有自己或管理员可以查看收藏和点赞 */}
            {isOwnProfile && (
              <>
                <Link
                  href={`/profile/${id}/favorites`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span className="font-medium">收藏</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {favorites_count || 0}
                  </span>
                </Link>

                <Link
                  href={`/profile/${id}/likes`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span className="font-medium">点赞</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {likes_count || 0}
                  </span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* 页面内容 */}
      {children}
    </div>
  );
}

