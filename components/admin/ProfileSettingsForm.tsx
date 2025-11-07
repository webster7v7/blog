'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';
import { Loader2, Save, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import AvatarCropModal from '@/components/AvatarCropModal';

interface ProfileSettingsFormProps {
  profile: {
    username: string;
    bio: string | null;
    website: string | null;
    avatar_url: string | null;
  };
}

export default function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string>(profile.avatar_url || '');
  const [formData, setFormData] = useState({
    username: profile.username || '',
    bio: profile.bio || '',
    website: profile.website || '',
    avatar_url: profile.avatar_url || '',
  });

  // 处理文件选择（打开裁剪模态框）
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 客户端验证：文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('仅支持 JPEG、PNG、WebP、GIF 格式');
      return;
    }

    // 记录原始大小
    setOriginalSize(file.size);

    // 读取文件并显示裁剪模态框
    const reader = new FileReader();
    reader.onloadend = () => {
      setRawImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // 裁剪完成后，自动压缩图片
  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropModal(false);
    setCompressing(true);

    try {
      // 将 Blob 转换为 File
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });

      // 自动压缩图片
      const options = {
        maxSizeMB: 0.5,            // 压缩到最大 500KB
        maxWidthOrHeight: 400,     // 头像不需要太大
        useWebWorker: true,        // 使用 Web Worker 后台压缩
        fileType: 'image/webp',    // 统一转换为 WebP 格式
      };

      const compressedFile = await imageCompression(croppedFile, options);
      
      // 记录压缩后大小
      setCompressedSize(compressedFile.size);
      
      // 显示压缩结果
      const compressionRate = ((1 - compressedFile.size / originalSize) * 100).toFixed(0);
      toast.success(
        `裁剪并压缩成功！减少 ${compressionRate}% 大小 (${(originalSize / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB)`,
        { duration: 3000 }
      );

      setAvatarFile(compressedFile);
      
      // 生成本地预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error: any) {
      console.error('Image compression error:', error);
      toast.error('图片压缩失败，请重试');
      
      // 压缩失败时使用裁剪后的原图
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
      setAvatarFile(croppedFile);
      setCompressedSize(croppedFile.size);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(croppedFile);
    } finally {
      setCompressing(false);
    }
  };

  // 处理头像上传
  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      toast.error('请先选择图片');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', avatarFile);

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { url } = await response.json();
      
      // 更新表单数据
      setFormData((prev) => ({ ...prev, avatar_url: url }));
      setPreviewUrl(url);
      setAvatarFile(null);
      
      toast.success('头像上传成功');
      router.refresh();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证用户名
    if (!formData.username.trim()) {
      toast.error('用户名不能为空');
      return;
    }

    // 验证用户名长度
    if (formData.username.trim().length < 2 || formData.username.trim().length > 20) {
      toast.error('用户名长度应在 2-20 个字符之间');
      return;
    }

    // 验证网站 URL 格式（如果提供）
    if (formData.website.trim()) {
      try {
        new URL(formData.website.trim());
      } catch {
        toast.error('网站地址格式不正确');
        return;
      }
    }

    // 验证头像 URL 格式（如果提供）
    if (formData.avatar_url.trim()) {
      try {
        new URL(formData.avatar_url.trim());
      } catch {
        toast.error('头像地址格式不正确');
        return;
      }
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 获取当前用户
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('未登录');
        return;
      }

      // 更新个人资料
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username.trim(),
          bio: formData.bio.trim() || null,
          website: formData.website.trim() || null,
          avatar_url: formData.avatar_url.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        // 检查是否是用户名重复错误
        if (error.code === '23505') {
          toast.error('该用户名已被使用，请选择其他用户名');
          return;
        }
        throw error;
      }

      toast.success('个人资料更新成功');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        个人资料
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 用户名 */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            用户名 *
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="输入用户名..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={loading}
            maxLength={20}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            2-20 个字符，用于显示在评论和文章中
          </p>
        </div>

        {/* 个人简介 */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            个人简介
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="介绍一下自己..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            disabled={loading}
            maxLength={200}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            最多 200 个字符
          </p>
        </div>

        {/* 个人网站 */}
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            个人网站
          </label>
          <input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={loading}
          />
        </div>

        {/* 头像上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            头像
          </label>
          
          {/* 预览和上传 */}
          <div className="flex items-start gap-4 mb-4">
            {/* 头像预览 */}
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="头像预览"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                onError={() => setPreviewUrl('')}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-2xl">
                {formData.username.charAt(0).toUpperCase()}
              </div>
            )}

            {/* 上传控制 */}
            <div className="flex-1">
              <input
                type="file"
                id="avatar-upload"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading || loading || compressing}
              />
              <label
                htmlFor="avatar-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  uploading || loading || compressing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {compressing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>压缩中...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>选择图片</span>
                  </>
                )}
              </label>
              
              {avatarFile && !compressing && (
                <button
                  type="button"
                  onClick={handleUploadAvatar}
                  disabled={uploading || loading}
                  className="ml-2 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>上传中...</span>
                    </>
                  ) : (
                    <span>上传</span>
                  )}
                </button>
              )}
              
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                支持 JPEG、PNG、WebP、GIF，自动压缩优化
              </p>
              {avatarFile && !compressing && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  已选择：{avatarFile.name} ({(avatarFile.size / 1024).toFixed(1)} KB)
                  {compressedSize > 0 && originalSize > compressedSize && (
                    <span className="ml-2 text-purple-600 dark:text-purple-400">
                      ✨ 已压缩 {((1 - compressedSize / originalSize) * 100).toFixed(0)}%
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* 可选：手动输入 URL */}
          <details className="mt-4">
            <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
              或手动输入头像 URL
            </summary>
            <input
              id="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, avatar_url: e.target.value }));
                setPreviewUrl(e.target.value);
              }}
              placeholder="https://example.com/avatar.jpg"
              className="mt-2 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              disabled={loading}
            />
          </details>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>保存更改</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 裁剪模态框 */}
      {showCropModal && (
        <AvatarCropModal
          imageSrc={rawImageSrc}
          onCropComplete={handleCropComplete}
          onClose={() => setShowCropModal(false)}
        />
      )}
    </div>
  );
}

