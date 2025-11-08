import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AuthDebugPage() {
  const supabase = await createServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🔐 认证调试信息
          </h1>

          <div className="space-y-6">
            {/* 用户基本信息 */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                ✅ 登录成功
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-32">用户 ID:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-mono text-sm break-all">
                    {user.id}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-32">邮箱:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-32">用户名:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {user.user_metadata?.username || '未设置'}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-32">创建时间:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {new Date(user.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-32">最后登录:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('zh-CN') : '无'}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-32">邮箱确认:</span>
                  <span className={`font-semibold ${user.email_confirmed_at ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user.email_confirmed_at ? '✅ 已确认' : '⚠️ 未确认（开发模式允许）'}
                  </span>
                </div>
              </div>
            </div>

            {/* 用户元数据 */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                📦 用户元数据
              </h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm font-mono">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                返回首页
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="px-6 py-3 border-2 border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                >
                  退出登录
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 说明信息 */}
        <div className="mt-8 backdrop-blur-md bg-blue-50/80 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30">
          <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            💡 说明
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li>✅ 认证系统正常工作</li>
            <li>✅ 用户信息已成功保存</li>
            <li>✅ 可以在开发模式下直接使用（无需邮件确认）</li>
            <li>⚠️ 生产环境部署时建议启用邮件确认</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

