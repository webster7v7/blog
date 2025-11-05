import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, Settings, Home, LogOut } from 'lucide-react';
import HideFrontendNav from '@/components/HideFrontendNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();

  // 检查用户是否登录
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?redirect=/admin');
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

  return (
    <>
      {/* 隐藏前台导航组件 */}
      <HideFrontendNav />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900">
        <div className="flex">
          {/* 侧边栏 */}
          <aside className="fixed left-0 top-0 h-screen w-64 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-r border-gray-200/30 dark:border-gray-800/30 p-6 z-50">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Webster
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">管理后台</p>
            </div>
          </Link>

          {/* 导航菜单 */}
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>控制台</span>
            </Link>

            <Link
              href="/admin/posts"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>文章管理</span>
            </Link>

                   <Link
                     href="/settings"
                     className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                   >
                     <Settings className="w-5 h-5" />
                     <span>设置</span>
                   </Link>

                   <Link
                     href="/admin/external-links"
                     className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                     </svg>
                     <span>外链导航</span>
                   </Link>

                   <div className="my-4 border-t border-gray-200/30 dark:border-gray-800/30" />

            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>返回首页</span>
            </Link>
          </nav>

          {/* 用户信息 */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-gray-200/30 dark:border-gray-800/30">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                {user.email}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                管理员
              </p>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="ml-64 flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
    </>
  );
}

