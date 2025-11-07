import { getCategoryBySlug, getPostsByCategory } from '@/lib/categories';
import PostCard from '@/components/PostCard';
import Breadcrumb from '@/components/Breadcrumb';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 60;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: '分类不存在 | Webster',
    };
  }

  return {
    title: `${category.name} | 分类 | Webster`,
    description: category.description || `查看所有 "${category.name}" 分类的文章`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(slug);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { label: '分类', href: '/categories' },
            { label: category.name, href: `/categories/${slug}` },
          ]}
        />
      </div>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
            {category.name}
          </h1>
        </div>

        {category.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {category.description}
          </p>
        )}

        <div className="text-sm text-gray-500 dark:text-gray-500">
          共 {posts.length} 篇文章
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-12 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-gray-200/30 dark:border-gray-800/30">
          <p className="text-gray-600 dark:text-gray-400">
            该分类下还没有文章
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

