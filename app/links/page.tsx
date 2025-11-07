import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Link2, Sparkles, User } from 'lucide-react';
import LinkCard from '@/components/LinkCard';
import PersonalLinkCard from '@/components/PersonalLinkCard';

// ⚡ 性能优化：启用页面缓存（10分钟，外部链接很少变动）
export const revalidate = 600;

export const metadata = {
  title: '友情链接 | Webster',
  description: '探索更多精彩内容',
};

export default async function LinksPage() {
  const supabase = await createServerClient();

  // 获取个人链接
  const { data: personalLinks } = await supabase
    .from('personal_links')
    .select('*')
    .order('order_index', { ascending: true });

  // 获取所有可见的外链
  const { data: links } = await supabase
    .from('external_links')
    .select('*')
    .eq('is_visible', true)
    .order('order', { ascending: true });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ✅ 性能优化：简化背景，删除 GPU 密集的模糊球动画 */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900">
        {/* 渐变叠加层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-100/10 to-transparent dark:via-purple-900/5" />
      </div>

      {/* 内容层 */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 md:mb-12 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-colors group shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">返回首页</span>
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                链接导航
              </span>
            </h1>
            <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </div>
          
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            探索更多精彩内容，发现志同道合的朋友
          </p>
        </div>

        {/* 个人链接部分 */}
        {personalLinks && personalLinks.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                个人链接
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {personalLinks.map((link, index) => (
                <PersonalLinkCard key={link.id} link={link} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* 友情链接部分 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Link2 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
              友情链接
            </h2>
          </div>
        </div>

        {/* 外链卡片网格 */}
        {links && links.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {links.map((link, index) => (
              <LinkCard key={link.id} link={link} index={index} />
            ))}
          </div>
        ) : (
          /* 空状态 */
          <div className="col-span-full text-center py-20">
            <div className="inline-block p-8 rounded-2xl backdrop-blur-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-xl">
              <Link2 className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
              <p className="text-lg text-gray-600 dark:text-gray-400">暂无友情链接</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">敬请期待更多精彩内容</p>
            </div>
          </div>
        )}

        {/* 底部装饰 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              共 {links?.length || 0} 个友情链接
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

