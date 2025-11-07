import { Suspense } from 'react';
import { getPostsWithCategories, getCachedTags } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import TagCloud from '@/components/TagCloud';
import { PostsListSkeleton, TagCloudSkeleton } from '@/components/loading/Skeleton';

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
    <div className="grid gap-6 md:gap-8">
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
    <section className="mb-12">
      <TagCloud tags={tags} />
    </section>
  );
}

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Webster
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          在校大学生，探索代码与创意的交界，记录学习旅程中的思考碎片。<br />
          用文字和代码编织想法，让每一次思考都成为成长的印记。
        </p>
      </section>

      {/* Tags Section with Suspense */}
      <Suspense fallback={<TagCloudSkeleton />}>
        <TagsSection />
      </Suspense>

      {/* Posts Section with Suspense */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          最新文章
        </h2>
        <Suspense fallback={<PostsListSkeleton />}>
          <PostsList />
        </Suspense>
      </section>
    </div>
  );
}
