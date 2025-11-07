import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { CreatePersonalLinkInput } from '@/types/projects';

// GET /api/admin/personal-links - Get all personal links
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: links, error } = await supabase
      .from('personal_links')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching personal links:', error);
      return NextResponse.json(
        { error: 'Failed to fetch personal links' },
        { status: 500 }
      );
    }

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error in GET /api/admin/personal-links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/personal-links - Create new personal link
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

    const body: CreatePersonalLinkInput = await request.json();
    
    const { data: link, error } = await supabase
      .from('personal_links')
      .insert([{
        name: body.name,
        icon: body.icon,
        url: body.url,
        description: body.description || null,
        order_index: body.order_index || 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating personal link:', error);
      return NextResponse.json(
        { error: 'Failed to create personal link' },
        { status: 500 }
      );
    }

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/personal-links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

