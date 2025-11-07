import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, Home, LogOut, MessageSquare, Users, Folder, Link2, Boxes } from 'lucide-react';
import MobileSidebarWrapper from '@/components/admin/MobileSidebarWrapper';
import { logout } from './actions';

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

  // 检查管理员权限
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return (
    <>
      {/* 移动端侧边栏 */}
      <MobileSidebarWrapper userEmail={user.email || ''} />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900">
        <div className="flex">
          {/* 桌面端侧边栏 */}
          <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-r border-gray-200/30 dark:border-gray-800/30 p-6 z-50">
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
              prefetch={true}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>控制台</span>
            </Link>

          <Link
            href="/admin/posts"
            prefetch={true}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>文章管理</span>
          </Link>

          <Link
            href="/admin/categories"
            prefetch={true}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <Folder className="w-5 h-5" />
            <span>分类管理</span>
          </Link>

          <Link
            href="/admin/comments"
            prefetch={true}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span>评论管理</span>
          </Link>

                  <Link
                    href="/admin/users"
                    prefetch={true}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    <span>用户管理</span>
                  </Link>

                   <Link
                     href="/admin/external-links"
                     prefetch={true}
                     className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                     </svg>
                     <span>外链导航</span>
                   </Link>

                   <Link
                     href="/admin/personal-links"
                     prefetch={true}
                     className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                   >
                     <Link2 className="w-5 h-5" />
                     <span>个人链接</span>
                   </Link>

                   <Link
                     href="/admin/projects"
                     prefetch={true}
                     className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                   >
                     <Boxes className="w-5 h-5" />
                     <span>已开发项目</span>
                   </Link>

                   <div className="my-4 border-t border-gray-200/30 dark:border-gray-800/30" />

            <Link
              href="/"
              prefetch={true}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>返回首页</span>
            </Link>
          </nav>

          {/* 用户信息 */}
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-gray-200/30 dark:border-gray-800/30">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                {user.email}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                管理员
              </p>
            </div>
            
            {/* 退出登录按钮 */}
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </form>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
    </>
  );
}

