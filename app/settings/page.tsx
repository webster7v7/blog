import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import ProfileSettingsForm from '@/components/admin/ProfileSettingsForm';
import AccountInfo from '@/components/admin/AccountInfo';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// ⚡ 性能优化：设置页面不使用缓存（需要实时数据）
export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = await createServerClient();

  // 获取用户信息
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未登录用户重定向到首页
  if (!user) {
    redirect('/?redirect=/settings');
  }

  // 获取个人资料
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 如果 profile 不存在，显示提示
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页</span>
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              设置
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              管理你的账户和个人资料
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              个人资料未找到，请联系管理员。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* 返回按钮 */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回首页</span>
        </Link>
      </div>

      <div className="space-y-6">
        {/* 头部 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            设置
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理你的账户和个人资料
          </p>
        </div>

        {/* 个人资料编辑表单 */}
        <ProfileSettingsForm profile={profile} />

        {/* 账户信息（只读） */}
        <AccountInfo user={user} profile={profile} />
      </div>
    </div>
  );
}

