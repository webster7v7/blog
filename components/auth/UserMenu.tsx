'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Settings, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('已退出登录');
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error('退出失败，请重试');
    }
  };

  // 获取用户名或邮箱
  const displayName = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
  
  // 生成头像（使用首字母）
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {/* 头像 */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium text-sm">
          {avatarLetter}
        </div>
        
        {/* 用户名 */}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
          {displayName}
        </span>
        
        {/* 下拉图标 */}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-xl border border-gray-200/30 dark:border-gray-800/30 py-2 z-50"
          >
            {/* 用户信息 */}
            <div className="px-4 py-3 border-b border-gray-200/30 dark:border-gray-800/30">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>

            {/* 菜单项 */}
            <div className="py-2">
              <button
                onClick={() => {
                  router.push(`/profile/${user.id}`);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>个人主页</span>
              </button>

              <button
                onClick={() => {
                  router.push('/settings');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>设置</span>
              </button>
            </div>

            {/* 退出登录 */}
            <div className="pt-2 border-t border-gray-200/30 dark:border-gray-800/30">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

