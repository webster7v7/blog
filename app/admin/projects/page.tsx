import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import ProjectsList from '@/components/admin/ProjectsList';

export const metadata = {
  title: '项目管理 - Admin',
};

export default async function ProjectsPage() {
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

  // Fetch all projects
  const { data: projects = [] } = await supabase
    .from('projects')
    .select('*')
    .order('order_index', { ascending: true });

  return (
    <div>
      <ProjectsList initialProjects={projects} />
    </div>
  );
}

