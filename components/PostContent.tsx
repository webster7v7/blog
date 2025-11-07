'use client';

import dynamic from 'next/dynamic';
import 'highlight.js/styles/github-dark.css';

// 动态导入Markdown渲染器（约250KB），仅在文章详情页加载
const MarkdownRenderer = dynamic(
  () => import('./MarkdownRenderer'),
  {
    loading: () => (
      <div className="prose prose-lg dark:prose-invert max-w-none animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-6"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    ),
    ssr: true,
  }
);

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none
      prose-headings:font-bold prose-headings:tracking-tight
      prose-h1:text-4xl prose-h1:mb-6
      prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
      prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
      prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-gray-900 dark:prose-strong:text-gray-100
      prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
      prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800
      prose-blockquote:border-l-purple-500 prose-blockquote:bg-purple-50/50 dark:prose-blockquote:bg-purple-900/10 prose-blockquote:py-1
      prose-img:rounded-lg prose-img:shadow-lg
    ">
      <MarkdownRenderer content={content} />
    </div>
  );
}

