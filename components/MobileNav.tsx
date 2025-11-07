'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Home, FolderOpen, Boxes, Archive, User } from 'lucide-react';
import OptimizedLink from './OptimizedLink';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  // 防止滚动穿透
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/categories', label: '分类', icon: FolderOpen },
    { href: '/projects', label: '项目', icon: Boxes },
    { href: '/archive', label: '归档', icon: Archive },
    { href: '/about', label: '关于', icon: User },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* 汉堡菜单按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="打开菜单"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 抽屉式侧边栏 */}
      <div
        className={`
          md:hidden fixed top-0 right-0 bottom-0 w-64 
          backdrop-blur-md bg-white/95 dark:bg-gray-900/95 
          border-l border-gray-200/30 dark:border-gray-800/30 
          z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/30 dark:border-gray-800/30">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Webster
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="关闭菜单"
          >
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* 导航链接 */}
        <nav className="p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <OptimizedLink
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className="
                  flex items-center gap-3 px-4 py-3 rounded-lg 
                  text-gray-700 dark:text-gray-300 
                  hover:bg-purple-50 dark:hover:bg-purple-900/20 
                  hover:text-purple-600 dark:hover:text-purple-400 
                  transition-colors font-medium
                "
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </OptimizedLink>
            );
          })}
        </nav>

        {/* 底部装饰 */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            在校大学生，探索代码与创意
          </div>
        </div>
      </div>
    </>
  );
}

