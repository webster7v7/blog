'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // 保留现有的 searchParams
    currentSearchParams.forEach((value, key) => {
      if (key !== 'page') {
        params.set(key, value);
      }
    });
    
    // 添加额外的 searchParams
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page') {
        params.set(key, value);
      }
    });
    
    // 设置页码
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    router.push(buildUrl(page));
  };

  // 生成页码数组（显示当前页前后各1页）
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // 总页数少，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总页数多，显示部分页码
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200/30 dark:border-gray-800/30">
      {/* 页面信息 */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        第 <span className="font-medium text-gray-900 dark:text-gray-100">{currentPage}</span> 页，
        共 <span className="font-medium text-gray-900 dark:text-gray-100">{totalPages}</span> 页
      </div>

      {/* 分页按钮 */}
      <div className="flex items-center gap-2">
        {/* 上一页 */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">上一页</span>
        </button>

        {/* 页码 */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* 下一页 */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <span className="hidden sm:inline">下一页</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

