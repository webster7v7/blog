'use client';

import OptimizedLink from './OptimizedLink';
import { useRouter } from 'next/navigation';
import { PostWithCategory } from '@/types/blog';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PostCardProps {
  post: PostWithCategory;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  
  // 直接从props获取分类数据（已在服务端预取）
  const category = post.categoryData;

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (category?.slug) {
      router.push(`/categories/${category.slug}`);
    }
  };

  return (
    <article className="group">
      <OptimizedLink href={`/posts/${post.slug}`}>
        <div className="
          backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 
          rounded-2xl p-6 
          border border-gray-200/30 dark:border-gray-800/30 
          hover:border-purple-400/50 dark:hover:border-purple-600/50 
          transition-[colors,opacity,transform] duration-300 
          hover:shadow-xl hover:shadow-purple-500/10 
          hover:-translate-y-2
          relative overflow-hidden
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
              <div className="mb-3">
                <span
                  onClick={handleCategoryClick}
                  className="
                    inline-flex items-center px-3 py-1 rounded-full 
                    text-xs font-medium text-white 
                    hover:opacity-90 transition-opacity cursor-pointer
                  "
                  style={{ backgroundColor: category.color }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryClick(e as any);
                    }
                  }}
                >
                  {category.name}
                </span>
              </div>
            )}
            
            <h2 className="
              text-2xl font-semibold mb-3 
              text-gray-900 dark:text-gray-100 
              group-hover:text-purple-600 dark:group-hover:text-purple-400 
              transition-colors
            ">
              {post.title}
            </h2>
            
            {post.excerpt && (
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <time className="text-gray-500 dark:text-gray-500">
                {format(new Date(post.published_at), 'yyyy年MM月dd日', { locale: zhCN })}
              </time>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="
                        px-2 py-1 text-xs rounded-full 
                        bg-purple-100 dark:bg-purple-900/30 
                        text-purple-700 dark:text-purple-300
                      "
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </OptimizedLink>
    </article>
  );
}
