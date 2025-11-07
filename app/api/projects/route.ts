import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/projects - Get published projects (public)
export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = supabase
      .from('projects')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

