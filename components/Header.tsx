'use client';

import OptimizedLink from './OptimizedLink';
import dynamic from 'next/dynamic';
import AuthButton from './auth/AuthButton';
import MobileNav from './MobileNav';
import { Link2 } from 'lucide-react';
import { SearchIconPlaceholder } from './loading/ComponentSkeletons';

// 动态导入SearchBar，保持SSR以确保SEO
const SearchBar = dynamic(() => import('./SearchBar'), {
  loading: () => <SearchIconPlaceholder />,
  ssr: true,
});

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-black/80 border-b border-gray-200/20 dark:border-gray-800/20">
      <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <OptimizedLink href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          Webster
        </OptimizedLink>
        
        <div className="flex items-center gap-2 md:gap-4">
          <SearchBar />
          
          {/* 外链导航 */}
          <OptimizedLink
            href="/links"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Link2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
              外链
            </span>
          </OptimizedLink>
          
          {/* 桌面端导航 */}
          <div className="hidden md:flex gap-6">
            <OptimizedLink 
              href="/" 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              首页
            </OptimizedLink>
            <OptimizedLink 
              href="/categories" 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              分类
            </OptimizedLink>
            <OptimizedLink 
              href="/projects" 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              项目
            </OptimizedLink>
            <OptimizedLink 
              href="/archive" 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              归档
            </OptimizedLink>
            <OptimizedLink 
              href="/about" 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              关于
            </OptimizedLink>
          </div>
          
          {/* 移动端导航 */}
          <MobileNav />
          
          <AuthButton />
        </div>
      </nav>
    </header>
  );
}

