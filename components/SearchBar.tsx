'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PostListItem } from '@/types/blog';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 自动聚焦
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 搜索
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchPosts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <>
      {/* 搜索按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border border-gray-200/30 dark:border-gray-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-600 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:inline">搜索</span>
        <kbd className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          ⌘K
        </kbd>
      </button>

      {/* 搜索弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />

            {/* 搜索框 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
            >
              <div className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl border border-gray-200/30 dark:border-gray-800/30 overflow-hidden">
                {/* 输入框 */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200/30 dark:border-gray-800/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索文章..."
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                  )}
                </div>

                {/* 结果列表 */}
                <div className="max-h-96 overflow-y-auto p-2">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      搜索中...
                    </div>
                  ) : results.length > 0 ? (
                    results.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </Link>
                    ))
                  ) : query ? (
                    <div className="text-center py-8 text-gray-500">
                      没有找到相关文章
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      输入关键词开始搜索
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

