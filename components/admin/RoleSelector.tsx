'use client';

import { useState } from 'react';
import { Shield, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface RoleSelectorProps {
  userId: string;
  currentRole: string;
  username: string;
  isCurrentUser: boolean;
}

export default function RoleSelector({
  userId,
  currentRole,
  username,
  isCurrentUser,
}: RoleSelectorProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return;

    if (
      !window.confirm(
        `确定要将用户 "${username}" 的角色从 "${
          currentRole === 'admin' ? '管理员' : '用户'
        }" 更改为 "${newRole === 'admin' ? '管理员' : '用户'}" 吗？`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新角色失败');
      }

      toast.success(`成功将 "${username}" 的角色更新为 "${newRole === 'admin' ? '管理员' : '用户'}"`);
      router.refresh();
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast.error(error.message || '更新角色时发生错误');
    } finally {
      setLoading(false);
    }
  };

  if (isCurrentUser) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed">
        {currentRole === 'admin' ? (
          <Shield className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
        <span>{currentRole === 'admin' ? '管理员' : '用户'}</span>
        <span className="text-xs">(自己)</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value)}
        disabled={loading}
        className="appearance-none px-3 py-1.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="user">用户</option>
        <option value="admin">管理员</option>
      </select>
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
        </div>
      )}
      {!loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {currentRole === 'admin' ? (
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          ) : (
            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </div>
      )}
    </div>
  );
}

