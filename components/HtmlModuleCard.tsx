'use client';

import { useState } from 'react';
import OptimizedLink from './OptimizedLink';
import { HtmlModuleWithCategory } from '@/types/html-module';
import { ExternalLink, FileText, Eye } from 'lucide-react';
import HtmlModuleModal from './HtmlModuleModal';

interface HtmlModuleCardProps {
  module: HtmlModuleWithCategory;
}

export default function HtmlModuleCard({ module }: HtmlModuleCardProps) {
  const [showModal, setShowModal] = useState(false);
  const category = module.categoryData;

  const handleClick = (e: React.MouseEvent) => {
    if (module.link_type === 'modal') {
      e.preventDefault();
      setShowModal(true);
    } else if (module.link_type === 'external' && module.external_url) {
      e.preventDefault();
      window.open(module.external_url, '_blank', 'noopener,noreferrer');
    }
    // 如果是 'page' 类型，让 OptimizedLink 处理导航
  };

  const getHref = () => {
    if (module.link_type === 'external' && module.external_url) {
      return module.external_url;
    }
    if (module.link_type === 'page') {
      return `/html-modules/${module.slug}`;
    }
    return '#';
  };

  const CardContent = (
    <div className="
      backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 
      rounded-2xl p-4 
      border border-gray-200/30 dark:border-gray-800/30 
      hover:border-purple-400/50 dark:hover:border-purple-600/50 
      transition-[colors,opacity,transform] duration-300 
      hover:shadow-xl hover:shadow-purple-500/10 
      hover:-translate-y-2
      relative overflow-hidden
      cursor-pointer
      min-h-[120px]
      flex flex-col justify-center
    ">
      {/* 光影效果 */}
      <div className="
        absolute inset-0 opacity-0 group-hover:opacity-100 
        transition-opacity duration-300 pointer-events-none
        bg-gradient-radial from-purple-400/10 via-transparent to-transparent
      " />
      
      <div className="relative">
        {/* 分类标签 */}
        {category && (
          <div className="mb-2">
            <span
              className="
                inline-flex items-center px-2 py-1 rounded-full 
                text-xs font-medium text-white 
                hover:opacity-90 transition-opacity
              "
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          </div>
        )}
        
        {/* 标题 */}
        <h3 className="
          text-lg font-semibold mb-2
          text-gray-900 dark:text-gray-100 
          group-hover:text-purple-600 dark:group-hover:text-purple-400 
          transition-colors
          flex items-center gap-2
        ">
          {module.title}
          {module.link_type === 'external' && (
            <ExternalLink className="w-4 h-4" />
          )}
          {module.link_type === 'page' && (
            <FileText className="w-4 h-4" />
          )}
        </h3>
        
        {/* 查看提示 */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          <span>点击查看</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <article className="group" onClick={handleClick}>
        {module.link_type === 'page' ? (
          <OptimizedLink href={getHref()}>
            {CardContent}
          </OptimizedLink>
        ) : (
          CardContent
        )}
      </article>

      {showModal && (
        <HtmlModuleModal
          module={module}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
