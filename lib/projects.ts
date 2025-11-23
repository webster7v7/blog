import { createPublicClient } from './supabase';
import { unstable_cache } from 'next/cache';
import type { Project } from '@/types/projects';

export const getCachedProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return data as unknown as Project[];
  },
  ['projects-list'],
  {
    revalidate: 300, // 5 minutes
    tags: ['projects'],
  }
);
