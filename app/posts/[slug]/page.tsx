import { getPostBySlug, getAllPosts, getAdjacentPosts } from '@/lib/posts';
import { extractHeadings } from '@/lib/markdown';
import { calculateReadingTime, countWords } from '@/lib/utils';
import PostContent from '@/components/PostContent';
import BackButton from '@/components/BackButton';
import Breadcrumb from '@/components/Breadcrumb';
import PostNavigation from '@/components/PostNavigation';
import ReadingProgress from '@/components/ReadingProgress';
import TableOfContents from '@/components/TableOfContents';
import InteractionBar from '@/components/interactions/InteractionBar';
import CommentSection from '@/components/comments/CommentSection';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return {
      title: '文章未找到',
    };
  }

  return {
    title: `${post.title} | Webster`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // 获取上下篇文章
  const { prev, next } = await getAdjacentPosts(slug);
  
  // 计算阅读时间和字数
  const readingTime = calculateReadingTime(post.content);
  const wordCount = countWords(post.content);
  
  // 提取目录
  const headings = extractHeadings(post.content);

  return (
    <>
      {/* 阅读进度条 */}
      <ReadingProgress />
      
      {/* 目录 */}
      <TableOfContents headings={headings} />
      
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* 返回按钮和面包屑 */}
        <div className="mb-8">
          <BackButton />
          <div className="mt-4">
            <Breadcrumb
              items={[
                { label: '文章', href: '/' },
                { label: post.title, href: `/posts/${post.slug}` },
              ]}
            />
          </div>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-center flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <time>
              {format(new Date(post.published_at), 'yyyy年MM月dd日', { locale: zhCN })}
            </time>
            <span>·</span>
            <span>{post.views} 次阅读</span>
            <span>·</span>
            <span>{readingTime} 分钟阅读</span>
            <span>·</span>
            <span>{wordCount} 字</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 互动工具栏 */}
        <InteractionBar
          postSlug={post.slug}
          postTitle={post.title}
          views={post.views}
          commentsCount={post.comments_count || 0}
        />

        {/* Content */}
        <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 md:p-12 border border-gray-200/30 dark:border-gray-800/30">
          <PostContent content={post.content} />
        </div>

        {/* 上下篇导航 */}
        <PostNavigation
          prevPost={prev ? { title: prev.title, slug: prev.slug, excerpt: prev.excerpt } : undefined}
          nextPost={next ? { title: next.title, slug: next.slug, excerpt: next.excerpt } : undefined}
        />

        {/* 评论区 */}
        <div className="mt-16">
          <CommentSection postSlug={post.slug} />
        </div>
      </article>
    </>
  );
}

