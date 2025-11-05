'use client';

import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Mail, Calendar, Shield } from 'lucide-react';

interface AccountInfoProps {
  user: {
    email?: string;
    created_at?: string;
  };
  profile: {
    role?: string | null;
    created_at?: string;
  };
}

export default function AccountInfo({ user, profile }: AccountInfoProps) {
  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        账户信息
      </h2>

      <div className="space-y-6">
        {/* 邮箱地址 */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              邮箱地址
            </label>
            <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">
              {user.email || '未设置'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              用于登录和接收通知
            </p>
          </div>
        </div>

        {/* 账户创建时间 */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              账户创建时间
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {user.created_at
                ? format(new Date(user.created_at), 'yyyy年MM月dd日 HH:mm', {
                    locale: zhCN,
                  })
                : '未知'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {user.created_at
                ? `已注册 ${Math.floor(
                    (Date.now() - new Date(user.created_at).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )} 天`
                : ''}
            </p>
          </div>
        </div>

        {/* 角色权限 */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              角色权限
            </label>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profile.role === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {profile.role === 'admin' ? '👑 管理员' : '👤 普通用户'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {profile.role === 'admin'
                ? '拥有完整的网站管理权限'
                : '可以发表评论和互动'}
            </p>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-800/30">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>提示：</strong>如需修改邮箱地址或密码，请联系系统管理员。
          </p>
        </div>
      </div>
    </div>
  );
}

