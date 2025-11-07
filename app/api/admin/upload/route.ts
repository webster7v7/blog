import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// POST /api/admin/upload - Upload file to Supabase storage
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/vnd.android.package-archive', // .apk
      'application/octet-stream', // Generic binary
      'application/zip',
      'application/x-zip-compressed'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.apk')) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: images, APK files' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 50MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('project-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return NextResponse.json(
        { error: 'Failed to upload file: ' + error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: publicUrl,
      path: data.path,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

