'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { HtmlModuleWithCategory } from '@/types/html-module';

interface HtmlModuleModalProps {
  module: HtmlModuleWithCategory;
  onClose: () => void;
}

export default function HtmlModuleModal({ module, onClose }: HtmlModuleModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState('100vh');

  // 禁止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // iframe高度自适应
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const adjustHeight = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const height = iframeDoc.documentElement.scrollHeight;
          setIframeHeight(`${height}px`);
        }
      } catch (error) {
        console.error('Failed to adjust iframe height:', error);
      }
    };

    const handleLoad = () => {
      adjustHeight();
      
      // 监听iframe内容变化
      try {
        const iframeDoc = iframe.contentDocument;
        if (iframeDoc) {
          const observer = new MutationObserver(adjustHeight);
          observer.observe(iframeDoc.body, {
            childList: true,
            subtree: true,
            attributes: true
          });
          
          // 清理函数
          return () => observer.disconnect();
        }
      } catch (error) {
        console.error('Failed to observe iframe content:', error);
      }
    };

    iframe.addEventListener('load', handleLoad);
    
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-screen h-screen overflow-y-auto bg-white dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 - 固定在右上角 */}
        <button
          onClick={onClose}
          className="fixed top-6 right-6 z-20 p-4 rounded-full bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 transition-all shadow-xl backdrop-blur-sm"
          aria-label="关闭"
        >
          <X className="w-7 h-7 text-gray-700 dark:text-gray-300" />
        </button>

        {/* HTML内容 - 使用iframe隔离 */}
        <div className="w-full">
          <iframe
            ref={iframeRef}
            srcDoc={module.content}
            className="w-full border-0"
            style={{ height: iframeHeight, minHeight: '100vh' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            title="HTML Module Content"
          />
        </div>
      </div>
    </div>
  );
}
