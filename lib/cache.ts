/**
 * 缓存工具库
 * 定义缓存时间常量和辅助函数
 */

// ==================== 缓存时间常量 ====================

/**
 * 静态内容缓存时间（1小时）
 * 用于：文章内容、文章详情
 */
export const CACHE_STATIC_CONTENT = 3600;

/**
 * 半静态数据缓存时间（10分钟）
 * 用于：分类、标签
 */
export const CACHE_SEMI_STATIC = 600;

/**
 * 列表数据缓存时间（5分钟）
 * 用于：文章列表、评论列表
 */
export const CACHE_LIST_DATA = 300;

/**
 * 聚合统计缓存时间（1分钟）
 * 用于：Dashboard统计、热门文章
 */
export const CACHE_STATS = 60;

/**
 * 不缓存
 * 用于：views、实时互动数据
 */
export const CACHE_NONE = 0;

// ==================== 缓存标签 ====================

export const CACHE_TAGS = {
  POSTS: 'posts',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  COMMENTS: 'comments',
  USERS: 'users',
  PROJECTS: 'projects',
} as const;

// ==================== 类型定义 ====================

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];

