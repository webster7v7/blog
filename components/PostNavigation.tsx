import Link from 'next/link';

interface PostNavigationProps {
  prevPost?: { title: string; slug: string; excerpt?: string };
  nextPost?: { title: string; slug: string; excerpt?: string };
}

export default function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <nav className="mt-12 pt-8 border-t border-gray-200/30 dark:border-gray-800/30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 上一篇 */}
        {prevPost ? (
          <Link href={`/posts/${prevPost.slug}`} className="group">
            <div className="h-full backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-xl p-6 border border-gray-200/30 dark:border-gray-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all hover:shadow-lg">
              <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>上一篇</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                {prevPost.title}
              </h3>
              {prevPost.excerpt && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {prevPost.excerpt}
                </p>
              )}
            </div>
          </Link>
        ) : (
          <div></div>
        )}

        {/* 下一篇 */}
        {nextPost && (
          <Link href={`/posts/${nextPost.slug}`} className="group">
            <div className="h-full backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-xl p-6 border border-gray-200/30 dark:border-gray-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all hover:shadow-lg">
              <div className="flex items-center justify-end gap-2 text-sm text-purple-600 dark:text-purple-400 mb-2">
                <span>下一篇</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 text-right">
                {nextPost.title}
              </h3>
              {nextPost.excerpt && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 text-right">
                  {nextPost.excerpt}
                </p>
              )}
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}

