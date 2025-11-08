'use client';

import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { ExternalLink } from '@/types/external-link';

interface LinkCardProps {
  link: ExternalLink;
  index: number;
}

export default function LinkCard({ link, index }: LinkCardProps) {
  // 智能判断图标类型并渲染
  const renderIcon = () => {
    const iconValue = link.icon;

    // 如果是图片 URL（包含 http:// 或 https://）
    if (iconValue && (iconValue.startsWith('http://') || iconValue.startsWith('https://'))) {
      return (
        <img
          src={iconValue}
          alt={link.name}
          className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-lg"
        />
      );
    }

    // 如果是 Lucide 图标名
    if (iconValue) {
      const Icon = Icons[iconValue as keyof typeof Icons];
      if (Icon) {
        return <Icon className="w-8 h-8 md:w-10 md:h-10 text-gray-700 dark:text-gray-200" strokeWidth={1.5} />;
      }
    }

    // 默认图标
    return <ExternalLinkIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-700 dark:text-gray-200" strokeWidth={1.5} />;
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ animationDelay: `${index * 100}ms` }}
      className="
        group relative 
        backdrop-blur-xl bg-white/20 dark:bg-white/10 
        border border-white/30 dark:border-white/20 
        rounded-2xl p-6 md:p-8 
        shadow-lg shadow-purple-500/10 
        hover:shadow-2xl hover:shadow-purple-500/20 
        transition-all duration-300 cursor-pointer overflow-hidden
        hover:scale-105 active:scale-95
        animate-fade-in-up
      "
    >
      {/* 悬停光效 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 via-pink-400/0 to-blue-400/0 group-hover:from-purple-400/10 group-hover:via-pink-400/10 group-hover:to-blue-400/10 transition-all duration-500 rounded-2xl" />
      
      {/* 内容 */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {/* 图标容器 */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl backdrop-blur-md bg-white/30 dark:bg-white/20 border border-white/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          {renderIcon()}
        </div>

        {/* 标题 */}
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
          {link.name}
        </h3>

        {/* 外链图标 */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
          <ExternalLinkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </a>
  );
}
