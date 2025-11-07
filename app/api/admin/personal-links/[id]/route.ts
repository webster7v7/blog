import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { UpdatePersonalLinkInput } from '@/types/projects';

// PUT /api/admin/personal-links/[id] - Update personal link
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const body: UpdatePersonalLinkInput = await request.json();
    
    const { data: link, error } = await supabase
      .from('personal_links')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating personal link:', error);
      return NextResponse.json(
        { error: 'Failed to update personal link' },
        { status: 500 }
      );
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error in PUT /api/admin/personal-links/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/personal-links/[id] - Delete personal link
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from('personal_links')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting personal link:', error);
      return NextResponse.json(
        { error: 'Failed to delete personal link' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Personal link deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/personal-links/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

