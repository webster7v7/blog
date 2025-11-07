import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // ✅ 优化：跳过Next.js Link组件的预取请求，避免不必要的认证和数据库查询
  const isPrefetch = 
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch';
  
  if (isPrefetch) {
    // 对于预取请求，直接返回最小化响应，不执行认证逻辑
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 刷新 session（重要：防止过期）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 保护管理员路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 直接查询用户角色（Edge Runtime 兼容）
    // 注意：不使用 unstable_cache，因为它需要文件系统访问，在 Edge Runtime 中不可用
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (favicon)
     * - public 文件夹中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

