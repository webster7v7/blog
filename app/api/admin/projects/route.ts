import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { CreateProjectInput } from '@/types/projects';

// GET /api/admin/projects - Get all projects
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published');
    
    let query = supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter by published status if provided
    if (published !== null && published !== 'all') {
      query = query.eq('is_published', published === 'true');
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
    console.error('Error in GET /api/admin/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/projects - Create new project
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: CreateProjectInput = await request.json();
    
    const { data: project, error } = await supabase
      .from('projects')
      .insert([{
        title: body.title,
        description: body.description || null,
        category: body.category,
        icon: body.icon || null,
        file_url: body.file_url || null,
        qr_code_url: body.qr_code_url || null,
        web_url: body.web_url || null,
        tags: body.tags || null,
        is_published: body.is_published !== undefined ? body.is_published : true,
        order_index: body.order_index || 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

