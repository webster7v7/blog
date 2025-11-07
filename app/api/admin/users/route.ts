import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerClient();

    // 检查用户是否登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否是管理员
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 获取所有用户资料
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // 为每个用户获取统计信息
    const usersWithStats = await Promise.all(
      profiles.map(async (profile) => {
        // 获取用户统计
        const { data: stats } = await supabase.rpc('get_user_stats', {
          user_uuid: profile.id,
        });

        return {
          ...profile,
          stats: stats?.[0] || {
            posts_count: 0,
            comments_count: 0,
            likes_received: 0,
            favorites_received: 0,
          },
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

