'use client';

import { Download, Eye, ExternalLink, QrCode } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '@/types/projects';
import { PROJECT_CATEGORIES } from '@/types/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [showQR, setShowQR] = useState(false);

  const handleDownload = async () => {
    if (project.file_url) {
      // Increment download count
      await fetch(`/api/projects/${project.id}/download`, { method: 'POST' });
      window.open(project.file_url, '_blank');
    }
  };

  const handleView = async () => {
    // Increment view count
    await fetch(`/api/projects/${project.id}/view`, { method: 'POST' });
  };

  return (
    <div
      onClick={handleView}
      style={{ animationDelay: `${index * 50}ms` }}
      className="
        group relative rounded-2xl 
        backdrop-blur-xl bg-white/40 dark:bg-white/5 
        border border-white/50 dark:border-white/10 
        hover:bg-white/60 dark:hover:bg-white/10 
        hover:border-purple-300/50 dark:hover:border-purple-500/30 
        hover:shadow-2xl hover:shadow-purple-500/20 
        transition-all duration-300 overflow-hidden
        animate-fade-in-up
      "
    >
      {/* 渐变背景光晕 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-600/5 dark:via-pink-600/5 dark:to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* 项目图标/封面 */}
      {project.icon && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={project.icon}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* 类型标签 */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/90 dark:bg-gray-900/90 text-purple-600 dark:text-purple-400 backdrop-blur-sm">
              {PROJECT_CATEGORIES[project.category].label}
            </span>
          </div>
        </div>
      )}

      {/* 内容 */}
      <div className="relative z-10 p-6">
        {/* 标题 */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {project.title}
        </h3>

        {/* 描述 */}
        {project.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* 标签 */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-md bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{project.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={14} />
            <span>{project.downloads}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {/* 网页链接 */}
          {project.web_url && (
            <a
              href={project.web_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/50"
            >
              <ExternalLink size={16} />
              <span className="text-sm font-medium">访问</span>
            </a>
          )}

          {/* 下载按钮 */}
          {project.file_url && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-blue-500/50"
            >
              <Download size={16} />
              <span className="text-sm font-medium">下载</span>
            </button>
          )}

          {/* 二维码按钮 */}
          {project.qr_code_url && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQR(!showQR);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-green-500/50"
            >
              <QrCode size={16} />
            </button>
          )}
        </div>

        {/* 二维码展示 */}
        {showQR && project.qr_code_url && (
          <div className="
            mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg text-center
            transition-all duration-300
            animate-fade-in
          ">
            <img
              src={project.qr_code_url}
              alt="QR Code"
              className="w-48 h-48 mx-auto rounded-lg"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              扫描二维码访问小程序
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
