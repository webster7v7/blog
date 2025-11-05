import { getPostsByTag, getAllTags } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Breadcrumb from '@/components/Breadcrumb';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  return {
    title: `${decodedTag} | 标签 | Webster`,
    description: `查看所有标签为 "${decodedTag}" 的文章`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = await getPostsByTag(decodedTag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { label: '标签', href: '/tags' },
            { label: decodedTag, href: `/tags/${tag}` },
          ]}
        />
      </div>

      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          标签：
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {decodedTag}
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          共 {posts.length} 篇文章
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

