'use client';

import * as LucideIcons from 'lucide-react';
import type { PersonalLink } from '@/types/projects';

interface PersonalLinkCardProps {
  link: PersonalLink;
  index: number;
}

export default function PersonalLinkCard({ link, index }: PersonalLinkCardProps) {
  // 智能判断图标类型并渲染
  const renderIcon = () => {
    const iconValue = link.icon;

    // 如果是图片 URL（包含 http:// 或 https://）
    if (iconValue && (iconValue.startsWith('http://') || iconValue.startsWith('https://'))) {
      return (
        <img
          src={iconValue}
          alt={link.name}
          className="w-6 h-6 object-cover rounded"
        />
      );
    }

    // 如果是 Lucide 图标名
    if (iconValue) {
      const IconComponent = LucideIcons[iconValue as keyof typeof LucideIcons];
      if (IconComponent) {
        return <IconComponent className="w-6 h-6" strokeWidth={2} />;
      }
    }

    // 默认图标
    return <LucideIcons.Link2 className="w-6 h-6" strokeWidth={2} />;
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ animationDelay: `${index * 50}ms` }}
      className="
        group relative p-6 rounded-2xl 
        backdrop-blur-xl bg-white/40 dark:bg-white/5 
        border border-white/50 dark:border-white/10 
        hover:bg-white/60 dark:hover:bg-white/10 
        hover:border-purple-300/50 dark:hover:border-purple-500/30 
        hover:shadow-2xl hover:shadow-purple-500/20 
        transition-all duration-300
        hover:scale-105 hover:-translate-y-1 active:scale-98
        animate-fade-in-up
      "
    >
      {/* 渐变背景光晕 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-600/5 dark:via-pink-600/5 dark:to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* 内容 */}
      <div className="relative z-10 flex flex-col items-center text-center gap-3">
        {/* 图标 */}
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
          {renderIcon()}
        </div>

        {/* 名称 */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {link.name}
          </h3>
          {link.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {link.description}
            </p>
          )}
        </div>
      </div>

      {/* 外部链接指示器 */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <LucideIcons.ExternalLink className="w-4 h-4 text-purple-500 dark:text-purple-400" />
      </div>
    </a>
  );
}
