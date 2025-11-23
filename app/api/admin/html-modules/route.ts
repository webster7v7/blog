import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/html-modules
export async function GET() {
  const supabase = await createServerClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null };
    
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('html_modules')
    .select('*, categories(*)')
    .order('order_index', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ modules: data });
}

// POST /api/admin/html-modules
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null };
    
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { 
    title, 
    slug, 
    description, 
    content, 
    category_id, 
    tags, 
    link_type, 
    external_url, 
    cover_image, 
    is_active, 
    order_index 
  } = body;

  if (!title || !slug || !content) {
    return NextResponse.json({ error: 'Title, slug and content are required' }, { status: 400 });
  }

  // @ts-expect-error - Supabase types not updating immediately
  const { data, error } = await supabase
    .from('html_modules')
    .insert({
      title,
      slug,
      description: description || null,
      content,
      category_id: category_id || null,
      tags: tags || null,
      link_type: link_type || 'modal',
      external_url: external_url || null,
      cover_image: cover_image || null,
      is_active: is_active ?? true,
      order_index: order_index ?? 0,
    })
    .select('*, categories(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ module: data });
}
