/**
 * 骨架屏组件
 * 用于Suspense fallback，提供加载占位符
 */

export function PostsListSkeleton() {
  return (
    <div className="grid gap-6 md:gap-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="
            backdrop-blur-md bg-white/60 dark:bg-gray-900/60 
            rounded-2xl p-6 
            border border-gray-200/30 dark:border-gray-800/30
            animate-pulse
          "
        >
          {/* 分类标签骨架 */}
          <div className="mb-3">
            <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </div>
          
          {/* 标题骨架 */}
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-3 w-3/4" />
          
          {/* 摘要骨架 */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
          </div>
          
          {/* 底部信息骨架 */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TagCloudSkeleton() {
  return (
    <div className="flex flex-wrap gap-3 justify-center animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-10 bg-gray-300 dark:bg-gray-700 rounded-full"
          style={{ width: `${60 + Math.random() * 60}px` }}
        />
      ))}
    </div>
  );
}

