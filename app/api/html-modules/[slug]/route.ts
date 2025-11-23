import { createPublicClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/html-modules/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createPublicClient();

  // @ts-expect-error - Supabase types not updating immediately
  const { data, error } = await supabase
    .from('html_modules')
    .select('*, categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ module: data });
}
