import { getPostsByMonth } from '@/lib/posts';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '归档 | Webster',
  description: '按时间归档的所有文章',
};

export const revalidate = 60;

const monthNames = ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'];

export default async function ArchivePage() {
  const postsByMonth = await getPostsByMonth();
  const years = Object.keys(postsByMonth).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          归档
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          按时间整理的所有文章
        </p>
      </header>

      <div className="space-y-12">
        {years.map((year) => {
          const months = Object.keys(postsByMonth[year]).sort((a, b) => Number(b) - Number(a));
          const yearTotal = months.reduce((sum, month) => sum + postsByMonth[year][month].length, 0);

          return (
            <section key={year} className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <span>{year}</span>
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {yearTotal} 篇文章
                </span>
              </h2>

              <div className="space-y-8">
                {months.map((month) => {
                  const posts = postsByMonth[year][month];
                  const monthName = monthNames[Number(month) - 1];

                  return (
                    <div key={month} className="relative pl-8 border-l-2 border-purple-200 dark:border-purple-900">
                      {/* 月份标记 */}
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500 dark:bg-purple-400" />

                      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                        {monthName}
                      </h3>

                      <div className="space-y-3">
                        {posts.map((post) => (
                          <Link
                            key={post.id}
                            href={`/posts/${post.slug}`}
                            className="block group"
                          >
                            <div className="flex items-baseline gap-3">
                              <time className="text-sm text-gray-500 dark:text-gray-500 shrink-0">
                                {new Date(post.published_at).getDate().toString().padStart(2, '0')}日
                              </time>
                              <h4 className="text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {post.title}
                              </h4>
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex gap-2 mt-2 ml-16">
                                {post.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

