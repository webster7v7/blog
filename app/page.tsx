import { getAllPosts, getAllTags } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import TagCloud from '@/components/TagCloud';

export const revalidate = 60;

export default async function Home() {
  const posts = await getAllPosts();
  const tagsWithCount = await getAllTags();
  const tags = tagsWithCount.map(t => t.name); // Convert to string array for TagCloud

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-fadeIn">
          Webster
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          在校大学生，探索代码与创意的交界，记录学习旅程中的思考碎片。<br />
          用文字和代码编织想法，让每一次思考都成为成长的印记。
        </p>
      </section>

      {/* Tags Section */}
      {tags.length > 0 && (
        <section className="mb-12">
          <TagCloud tags={tags} />
        </section>
      )}

      {/* Posts Section */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          最新文章
        </h2>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              暂无文章，敬请期待...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
