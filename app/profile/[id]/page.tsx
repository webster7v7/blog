import { createServerClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Mail, Globe, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import PostCard from '@/components/PostCard';
import type { Metadata } from 'next';

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

  return {
    title: profile ? `${profile.username} | Webster` : '用户资料 | Webster',
    description: profile ? `${profile.username} 的个人主页` : '查看用户资料',
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  // 获取用户资料
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    notFound();
  }

  // 获取用户发布的文章
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // 生成头像（使用首字母）
  const avatarLetter = profile.username.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* 用户资料卡片 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30 mb-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* 头像 */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {avatarLetter}
          </div>

          {/* 用户信息 */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {profile.username}
            </h1>
            
            {profile.bio && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {profile.bio}
              </p>
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
              
              {posts && (
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{posts.length} 篇文章</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 用户文章列表 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          发布的文章
        </h2>
        
        {posts && posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-gray-200/30 dark:border-gray-800/30">
            <p className="text-gray-600 dark:text-gray-400">
              还没有发布任何文章
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

