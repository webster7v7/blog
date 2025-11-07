'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase-client';
import { User } from '@supabase/supabase-js';
import { LogIn } from 'lucide-react';
import UserMenu from './UserMenu';

// 动态导入AuthModal，仅在需要时加载
const AuthModal = dynamic(() => import('./AuthModal'), {
  ssr: false,
});

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // 获取当前用户
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  if (user) {
    return <UserMenu user={user} />;
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 z-10 relative"
      >
        <LogIn className="w-4 h-4" />
        <span>登录</span>
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </>
  );
}

