import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// POST /api/projects/[id]/download - Increment download count
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params; // Next.js 15: Await params before accessing
    
    const { error } = await supabase.rpc('increment_project_downloads', {
      project_id: id
    });

    if (error) {
      // If RPC doesn't exist, fall back to manual update
      const { data: project } = await supabase
        .from('projects')
        .select('downloads')
        .eq('id', id)
        .single();

      if (project) {
        await supabase
          .from('projects')
          .update({ downloads: project.downloads + 1 })
          .eq('id', id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

