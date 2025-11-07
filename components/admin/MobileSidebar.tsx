'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  FileText, 
  Home, 
  LogOut, 
  MessageSquare, 
  Users, 
  Folder,
  ExternalLink,
  Link2,
  Boxes
} from 'lucide-react';

interface MobileSidebarProps {
  userEmail: string;
  onLogout: () => void;
}

export default function MobileSidebar({ userEmail, onLogout }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: '控制台' },
    { href: '/admin/posts', icon: FileText, label: '文章管理' },
    { href: '/admin/categories', icon: Folder, label: '分类管理' },
    { href: '/admin/comments', icon: MessageSquare, label: '评论管理' },
    { href: '/admin/users', icon: Users, label: '用户管理' },
    { href: '/admin/external-links', icon: ExternalLink, label: '外链导航' },
    { href: '/admin/personal-links', icon: Link2, label: '个人链接' },
    { href: '/admin/projects', icon: Boxes, label: '已开发项目' },
  ];

  return (
    <>
      {/* 移动端顶栏 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200/30 dark:border-gray-800/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Webster
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 移动端侧边栏（可切换） */}
      {isOpen && (
        <>
          {/* 遮罩 */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 侧边栏 */}
          <aside className="lg:hidden fixed top-0 left-0 bottom-0 w-64 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border-r border-gray-200/30 dark:border-gray-800/30 p-6 z-50 overflow-y-auto">
            {/* Logo */}
            <Link 
              href="/admin" 
              className="flex items-center gap-2 mb-8"
              onClick={() => setIsOpen(false)}
            >
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
            <nav className="space-y-2 mb-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="my-4 border-t border-gray-200/30 dark:border-gray-800/30" />

              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>返回首页</span>
              </Link>
            </nav>

            {/* 用户信息 */}
            <div className="mt-6 space-y-3">
              <div className="backdrop-blur-md bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-gray-200/30 dark:border-gray-800/30">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                  {userEmail}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  管理员
                </p>
              </div>
              
              {/* 退出登录按钮 */}
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

