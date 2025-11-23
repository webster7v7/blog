import { Suspense } from 'react';
import { getPostsWithCategories, getCachedTags } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import TagCloud from '@/components/TagCloud';
import { PostsListSkeleton, TagCloudSkeleton } from '@/components/loading/Skeleton';
import SiteStats from '@/components/SiteStats';
import PersonalSidebar from '@/components/home/PersonalSidebar';
import ExternalSidebar from '@/components/home/ExternalSidebar';
import HomeProjectsSection from '@/components/home/HomeProjectsSection';
import HtmlModulesDisplay from '@/components/home/HtmlModulesDisplay';

export const revalidate = 300; // 5分钟（与缓存策略一致）

// 文章列表组件（独立的async组件，用于Suspense）
async function PostsList() {
  const posts = await getPostsWithCategories();
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          暂无文章，敬请期待...
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// 标签云组件（独立的async组件，用于Suspense）
async function TagsSection() {
  const tagsWithCount = await getCachedTags();
  const tags = tagsWithCount.map(t => t.name);
  
  if (tags.length === 0) {
    return null;
  }
  
  return (
    <section className="mb-10">
      <TagCloud tags={tags} />
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex justify-center min-h-screen">
      {/* 左侧全高侧边栏 (仅在 XL 屏幕显示) */}
      <div className="hidden xl:flex w-[280px] flex-col sticky top-0 h-screen pt-[100px] border-r border-gray-200/40 dark:border-gray-800/40 bg-gray-50/30 dark:bg-gray-900/10 backdrop-blur-sm">
        <Suspense fallback={<div className="px-6 space-y-4 animate-pulse"><div className="h-6 w-24 bg-gray-200 rounded"></div><div className="space-y-3"><div className="h-10 bg-gray-200 rounded"></div><div className="h-10 bg-gray-200 rounded"></div></div></div>}>
          <PersonalSidebar />
        </Suspense>
      </div>

      {/* 中间主要内容 */}
      <div className="flex-1 max-w-[960px] px-4 md:px-8 py-8 md:py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in-down">
              Webster
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              在校大学生，探索代码与创意的交界，记录学习旅程中的思考碎片。<br />
              用文字和代码编织想法，让每一次思考都成为成长的印记。
            </p>
          </section>

          {/* Tags Section */}
          <Suspense fallback={<TagCloudSkeleton />}>
            <TagsSection />
          </Suspense>

          {/* HTML Modules Section */}
          <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />}>
            <HtmlModulesDisplay />
          </Suspense>

          {/* Posts Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                最新文章
              </h2>
              <a href="/archive" className="text-sm font-medium text-purple-600 hover:underline">
                查看全部 &rarr;
              </a>
            </div>
            <Suspense fallback={<PostsListSkeleton />}>
              <PostsList />
            </Suspense>
          </section>

          {/* Projects Section (Inserted Here) */}
          <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />}>
            <HomeProjectsSection />
          </Suspense>
        </div>
      </div>

      {/* 右侧全高侧边栏 (仅在 XL 屏幕显示) */}
      <div className="hidden xl:flex w-[280px] flex-col sticky top-0 h-screen pt-[100px] border-l border-gray-200/40 dark:border-gray-800/40 bg-gray-50/30 dark:bg-gray-900/10 backdrop-blur-sm">
        <Suspense fallback={<div className="px-6 space-y-4 animate-pulse"><div className="h-6 w-24 bg-gray-200 rounded"></div><div className="space-y-3"><div className="h-10 bg-gray-200 rounded"></div><div className="h-10 bg-gray-200 rounded"></div></div></div>}>
          <ExternalSidebar />
        </Suspense>
      </div>
    </div>
  );
}
