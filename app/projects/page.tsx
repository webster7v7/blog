import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/types/projects';
import { PROJECT_CATEGORIES } from '@/types/projects';

export const metadata = {
  title: '已开发项目 | Webster',
  description: '探索我的开发项目作品集',
};

export default async function ProjectsPage() {
  const supabase = await createServerClient();

  // 获取所有已发布的项目
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  // 按类型分组项目
  const projectsByCategory = projects?.reduce((acc, project) => {
    if (!acc[project.category]) {
      acc[project.category] = [];
    }
    acc[project.category].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 动态渐变背景 */}
      {/* ✅ 性能优化：简化背景，删除 GPU 密集的模糊球动画 */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900">
        {/* 渐变叠加层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-100/10 to-transparent dark:via-purple-900/5" />
      </div>

      {/* 内容层 */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 md:mb-12 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-colors group shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">返回首页</span>
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                已开发项目
              </span>
            </h1>
            <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </div>
          
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            探索我的开发作品集，涵盖小程序、APP、网页等多种类型
          </p>
        </div>

        {/* 按类型显示项目 */}
        {projectsByCategory && Object.keys(projectsByCategory).length > 0 ? (
          <div className="space-y-12 md:space-y-16">
            {Object.entries(PROJECT_CATEGORIES).map(([categoryKey, categoryInfo]) => {
              const categoryProjects = projectsByCategory[categoryKey];
              if (!categoryProjects || categoryProjects.length === 0) return null;

              const IconComponent = require('lucide-react')[categoryInfo.icon];

              return (
                <div key={categoryKey}>
                  {/* 分类标题 */}
                  <div className="flex items-center gap-3 mb-6">
                    {IconComponent && <IconComponent className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                      {categoryInfo.label}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({categoryProjects.length})
                    </span>
                  </div>

                  {/* 项目卡片网格 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {categoryProjects.map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 空状态 */
          <div className="text-center py-20">
            <div className="inline-block p-8 rounded-2xl backdrop-blur-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-xl">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
              <p className="text-lg text-gray-600 dark:text-gray-400">暂无已发布项目</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">敬请期待更多精彩作品</p>
            </div>
          </div>
        )}

        {/* 底部装饰 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              共 {projects?.length || 0} 个项目
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

