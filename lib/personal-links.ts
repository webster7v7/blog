import { createPublicClient } from './supabase';
import { unstable_cache } from 'next/cache';
import type { PersonalLink } from '@/types/projects';
import type { ExternalLink } from '@/types/external-link';

export const getCachedPersonalLinks = unstable_cache(
  async (): Promise<PersonalLink[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('personal_links')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching personal links:', error);
      return [];
    }

    return data as unknown as PersonalLink[];
  },
  ['personal-links-list'],
  {
    revalidate: 300, // 5 minutes
    tags: ['personal-links'],
  }
);

export const getCachedExternalLinks = unstable_cache(
  async (): Promise<ExternalLink[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('external_links')
      .select('*')
      .eq('is_visible', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching external links:', error);
      return [];
    }

    return data as unknown as ExternalLink[];
  },
  ['external-links-list'],
  {
    revalidate: 300, // 5 minutes
    tags: ['external-links'],
  }
);
