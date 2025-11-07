'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { X } from 'lucide-react';

interface AvatarCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
}

/**
 * 头像裁剪模态框
 * 
 * 功能：
 * - 圆形裁剪框（适合头像）
 * - 支持缩放（zoom）
 * - 支持拖拽（pan）
 * - 实时预览
 */
export default function AvatarCropModal({ imageSrc, onCropComplete, onClose }: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  // 裁剪完成回调（获取裁剪区域）
  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // 生成裁剪后的图片
  const createCroppedImage = async (): Promise<Blob | null> => {
    if (!croppedAreaPixels) return null;

    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // 设置画布大小为裁剪区域大小
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // 绘制裁剪后的图片
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // 转换为 Blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob failed'));
          }
        }, 'image/jpeg', 0.95);
      });
    } catch (error) {
      console.error('Error creating cropped image:', error);
      return null;
    }
  };

  // 确认裁剪
  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const croppedImage = await createCroppedImage();
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (error) {
      console.error('Crop error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            裁剪头像
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={processing}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 裁剪区域 */}
        <div className="relative h-96 bg-gray-100 dark:bg-gray-800">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* 缩放控制 */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            缩放
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1x</span>
            <span>2x</span>
            <span>3x</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? '处理中...' : '确认裁剪'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 辅助函数：创建 Image 对象
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // 避免 CORS 问题
    image.src = url;
  });
}

