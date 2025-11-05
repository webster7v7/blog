import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // 如果有错误，重定向到首页并显示错误
  if (error) {
    console.error('Auth callback error:', error, error_description);
    return NextResponse.redirect(`${requestUrl.origin}/?error=${error}`);
  }

  // 如果有验证码，交换 code 换取 session
  if (code) {
    const supabase = await createServerClient();
    
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_failed`);
    }
  }

  // 成功后重定向到首页
  return NextResponse.redirect(requestUrl.origin);
}
