export default function CommentsLoading() {
  return (
    <div className="space-y-6">
      {/* 头部骨架 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      {/* 内容骨架 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/30 dark:border-gray-800/30 p-6">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

