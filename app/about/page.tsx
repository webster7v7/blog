import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于 | Webster',
  description: '了解更多关于 Webster 的信息',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 md:p-12 border border-gray-200/30 dark:border-gray-800/30">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          关于我
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              你好，我是 Webster 👋
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              我是一名在校大学生，热爱编程，喜欢探索技术的无限可能。
              这个博客是我记录学习旅程、分享技术思考和生活感悟的地方。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              在这里，你会看到我对代码的思考、对技术的探索，
              以及对生活的感悟。希望这些内容能够对你有所启发。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              技术栈
            </h2>
            <div className="flex flex-wrap gap-3">
              {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Node.js'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              关于这个博客
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              这个博客使用 Next.js 15 和 Supabase 构建，追求简洁、优雅、富有生命力的设计理念。
              整体设计风格以&ldquo;通透、零重力、轻透&rdquo;为核心，希望给你带来舒适的阅读体验。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              如果你对技术实现感兴趣，欢迎查看源代码或与我交流。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              联系方式
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              如果你想与我交流或有任何问题，欢迎通过以下方式联系我：
            </p>
            <ul className="list-none space-y-2 mt-4">
              <li className="text-gray-700 dark:text-gray-300">
                📧 邮箱：<span className="text-purple-600 dark:text-purple-400">your.email@example.com</span>
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                🐙 GitHub：<a href="https://github.com" className="text-purple-600 dark:text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">@webster</a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

