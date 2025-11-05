'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('登录成功！');
        router.refresh();
        onSuccess?.();
      }
    } catch (error) {
      toast.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            邮箱地址
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 transition-all duration-200 placeholder:text-gray-400"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            密码
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 transition-all duration-200 placeholder:text-gray-400"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            登录中...
          </span>
        ) : (
          '登录'
        )}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/95 dark:bg-gray-900/95 text-gray-500">
            还没有账号？
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSwitchToSignUp}
        className="w-full py-3 px-4 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
      >
        立即注册
      </button>
    </form>
  );
}

