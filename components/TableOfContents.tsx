'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TOCItem[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* 移动端按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-24 right-8 z-40 p-3 rounded-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-gray-200/30 dark:border-gray-800/30 shadow-lg"
        aria-label="目录"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-purple-600 dark:text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </motion.button>

      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:block fixed right-8 top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            目录
          </h3>
          <nav>
            <ul className="space-y-2">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                >
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={`text-left text-sm transition-colors ${
                      activeId === heading.id
                        ? 'text-purple-600 dark:text-purple-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* 移动端弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto backdrop-blur-md bg-white/95 dark:bg-gray-900/95 rounded-t-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  目录
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <nav>
                <ul className="space-y-2">
                  {headings.map((heading) => (
                    <li
                      key={heading.id}
                      style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                    >
                      <button
                        onClick={() => scrollToHeading(heading.id)}
                        className={`text-left text-sm transition-colors ${
                          activeId === heading.id
                            ? 'text-purple-600 dark:text-purple-400 font-medium'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {heading.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

