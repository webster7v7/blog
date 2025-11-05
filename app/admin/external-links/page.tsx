import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import ExternalLinksList from '@/components/admin/ExternalLinksList';

export default async function ExternalLinksAdminPage() {
  const supabase = await createServerClient();

  // 检查用户是否登录
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?redirect=/admin/external-links');
  }

  // 检查是否是管理员
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  // 获取所有外链
  const { data: links } = await supabase
    .from('external_links')
    .select('*')
    .order('order', { ascending: true });

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          外链导航管理
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          管理顶部导航栏的外部链接
        </p>
      </div>

      {/* 外链列表 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
        <ExternalLinksList initialLinks={links || []} />
      </div>
    </div>
  );
}

