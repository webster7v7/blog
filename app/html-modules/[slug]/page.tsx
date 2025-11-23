import { createPublicClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { HtmlModuleWithCategory } from '@/types/html-module';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 生成元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();

  // @ts-ignore
  const { data: module } = await supabase
    .from('html_modules')
    .select('title, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!module) {
    return {
      title: '模块未找到',
    };
  }

  return {
    title: module.title,
    description: module.description || undefined,
  };
}

export default async function HtmlModulePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createPublicClient();

  // @ts-ignore
  const { data: module, error } = await supabase
    .from('html_modules')
    .select('*, categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !module) {
    notFound();
  }

  const typedModule = {
    ...module,
    categoryData: module.categories || null,
  } as HtmlModuleWithCategory;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部 */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {typedModule.title}
          </h1>
          
          {typedModule.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              {typedModule.description}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {typedModule.categoryData && (
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: typedModule.categoryData.color }}
              >
                {typedModule.categoryData.name}
              </span>
            )}
            
            {typedModule.tags && typedModule.tags.length > 0 && (
              <>
                {typedModule.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  >
                    {tag}
                  </span>
                ))}
              </>
            )}
          </div>
        </header>

        {/* 内容 */}
        <article 
          className="prose prose-lg dark:prose-invert max-w-none
            backdrop-blur-md bg-white/60 dark:bg-gray-900/60 
            rounded-2xl p-8 
            border border-gray-200/30 dark:border-gray-800/30
            shadow-lg"
          dangerouslySetInnerHTML={{ __html: typedModule.content }}
        />

        {/* 返回按钮 */}
        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
