import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/external-links - 获取所有可见的外链
export async function GET() {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('external_links')
      .select('*')
      .eq('is_visible', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching external links:', error);
      return NextResponse.json(
        { error: 'Failed to fetch external links' },
        { status: 500 }
      );
    }

    return NextResponse.json({ links: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

