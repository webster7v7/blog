import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * POST /api/user/upload-avatar
 * 用户上传头像到 Supabase Storage
 * 
 * 安全限制：
 * - 仅限登录用户
 * - 仅允许图片格式 (JPEG, PNG, WebP, GIF)
 * - 文件大小限制：2MB
 * - 自动更新 profiles.avatar_url
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
    // 1. 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    // 2. 解析 FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. 验证文件类型（仅图片）
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Allowed formats: JPEG, PNG, WebP, GIF',
          allowedTypes 
        },
        { status: 400 }
      );
    }

    // 4. 验证文件大小（2MB 限制）
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
          currentSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          maxSize: `${maxSize / (1024 * 1024)}MB`
        },
        { status: 400 }
      );
    }

    // 5. 查询并删除旧头像（节省存储空间）
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single<{ avatar_url: string | null }>();

      if (profile?.avatar_url) {
        // 检查是否为 Supabase Storage URL
        // 格式示例: https://xxx.supabase.co/storage/v1/object/public/project-files/avatars/...
        const isSupabaseUrl = profile.avatar_url.includes('/storage/v1/object/public/project-files/');
        
        if (isSupabaseUrl) {
          // 提取文件路径 (avatars/user_id/filename)
          const urlParts = profile.avatar_url.split('/storage/v1/object/public/project-files/');
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1];
            
            // 尝试删除旧头像
            const { error: deleteError } = await supabase.storage
              .from('project-files')
              .remove([oldFilePath]);

            if (deleteError) {
              // 删除失败不阻止上传，仅记录日志
              console.warn('Warning: Failed to delete old avatar:', deleteError.message);
            } else {
              console.log('✅ Old avatar deleted successfully:', oldFilePath);
            }
          }
        }
      }
    } catch (error: any) {
      // 删除旧头像失败不应阻止新头像上传
      console.warn('Warning: Error during old avatar cleanup:', error.message);
    }

    // 6. 生成唯一文件名（基于 Supabase 官方最佳实践）
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    
    // 文件路径：avatars/{user_id}/{unique_filename}
    const filePath = `avatars/${user.id}/${fileName}`;

    // 7. 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')  // 使用已有的 bucket
      .upload(filePath, file, {
        cacheControl: '3600',  // 浏览器缓存 1 小时
        upsert: false,         // 不覆盖已有文件
      });

    if (uploadError) {
      console.error('Error uploading avatar to Supabase Storage:', uploadError);
      return NextResponse.json(
        { 
          error: 'Failed to upload file',
          details: uploadError.message 
        },
        { status: 500 }
      );
    }

    // 8. 获取公开访问 URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(uploadData.path);

    // 9. 更新用户 profile 的 avatar_url
    const { error: updateError } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase generated types issue with update
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile avatar_url:', updateError);
      
      // 尝试删除已上传的文件（回滚）
      await supabase.storage
        .from('project-files')
        .remove([uploadData.path]);

      return NextResponse.json(
        { 
          error: 'Failed to update profile',
          details: updateError.message 
        },
        { status: 500 }
      );
    }

    // 10. 成功响应
    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: uploadData.path,
      size: file.size,
      type: file.type,
      message: 'Avatar uploaded successfully',
    });

  } catch (error: any) {
    console.error('Unexpected error in POST /api/user/upload-avatar:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

