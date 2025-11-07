/**
 * 组件骨架屏
 * 用于动态导入组件的loading状态
 */

export function CommentsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* 评论表单骨架 */}
      <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-4 border border-gray-200/30 dark:border-gray-800/30">
        <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded mb-3" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-24" />
      </div>
      
      {/* 评论列表骨架 */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-4 border border-gray-200/30 dark:border-gray-800/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchIconPlaceholder() {
  return (
    <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
  );
}

