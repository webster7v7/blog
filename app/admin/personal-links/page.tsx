import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import PersonalLinksList from '@/components/admin/PersonalLinksList';

export const metadata = {
  title: '个人链接管理 - Admin',
};

export default async function PersonalLinksPage() {
  const supabase = await createServerClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // Fetch all personal links
  const { data: links = [] } = await supabase
    .from('personal_links')
    .select('*')
    .order('order_index', { ascending: true });

  return (
    <div>
      <PersonalLinksList initialLinks={links} />
    </div>
  );
}

