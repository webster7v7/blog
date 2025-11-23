import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/html-modules/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  // @ts-ignore - Supabase types not updating immediately
  const { data, error } = await supabase
    .from('html_modules')
    .update({
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
      order_index,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, categories(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ module: data });
}

// DELETE /api/admin/html-modules/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { error } = await supabase
    .from('html_modules')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
