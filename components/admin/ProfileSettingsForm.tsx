'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';
import { Loader2, Save } from 'lucide-react';

interface ProfileSettingsFormProps {
  profile: {
    username: string;
    bio: string | null;
    website: string | null;
    avatar_url: string | null;
  };
}

export default function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: profile.username || '',
    bio: profile.bio || '',
    website: profile.website || '',
    avatar_url: profile.avatar_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证用户名
    if (!formData.username.trim()) {
      toast.error('用户名不能为空');
      return;
    }

    // 验证用户名长度
    if (formData.username.trim().length < 2 || formData.username.trim().length > 20) {
      toast.error('用户名长度应在 2-20 个字符之间');
      return;
    }

    // 验证网站 URL 格式（如果提供）
    if (formData.website.trim()) {
      try {
        new URL(formData.website.trim());
      } catch {
        toast.error('网站地址格式不正确');
        return;
      }
    }

    // 验证头像 URL 格式（如果提供）
    if (formData.avatar_url.trim()) {
      try {
        new URL(formData.avatar_url.trim());
      } catch {
        toast.error('头像地址格式不正确');
        return;
      }
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 获取当前用户
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('未登录');
        return;
      }

      // 更新个人资料
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username.trim(),
          bio: formData.bio.trim() || null,
          website: formData.website.trim() || null,
          avatar_url: formData.avatar_url.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        // 检查是否是用户名重复错误
        if (error.code === '23505') {
          toast.error('该用户名已被使用，请选择其他用户名');
          return;
        }
        throw error;
      }

      toast.success('个人资料更新成功');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        个人资料
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 用户名 */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            用户名 *
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="输入用户名..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={loading}
            maxLength={20}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            2-20 个字符，用于显示在评论和文章中
          </p>
        </div>

        {/* 个人简介 */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            个人简介
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="介绍一下自己..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            disabled={loading}
            maxLength={200}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            最多 200 个字符
          </p>
        </div>

        {/* 个人网站 */}
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            个人网站
          </label>
          <input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={loading}
          />
        </div>

        {/* 头像 URL */}
        <div>
          <label
            htmlFor="avatar_url"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            头像 URL
          </label>
          <input
            id="avatar_url"
            type="url"
            value={formData.avatar_url}
            onChange={(e) => setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))}
            placeholder="https://example.com/avatar.jpg"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={loading}
          />
          {formData.avatar_url && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">头像预览：</p>
              <img
                src={formData.avatar_url}
                alt="头像预览"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>保存更改</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

