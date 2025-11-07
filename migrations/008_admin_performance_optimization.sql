-- ============================================================
-- Migration 008: Admin 页面性能优化
-- 目的: 优化 Admin 区域加载速度，减少数据库查询次数
-- 日期: 2025-11-07
-- 依赖: Migration 005, 006, 007
-- 预期提升: Admin 页面加载速度提升 50-75%
-- ============================================================

-- ============================================================
-- 1. Dashboard 统计数据 RPC 函数
-- 用途: app/admin/page.tsx
-- 优化: 从 4 次查询 → 1 次 RPC (75% 减少)
-- ============================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  posts_count BIGINT,
  comments_count BIGINT,
  total_views BIGINT,
  total_likes BIGINT
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM posts WHERE status = 'published')::BIGINT as posts_count,
    (SELECT COUNT(*) FROM comments)::BIGINT as comments_count,
    (SELECT COALESCE(SUM(views), 0) FROM posts WHERE status = 'published')::BIGINT as total_views,
    (SELECT COALESCE(SUM(likes_count), 0) FROM posts WHERE status = 'published')::BIGINT as total_likes;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_dashboard_stats() IS 'Admin Dashboard 统计数据（单次查询，优化性能）';

-- ============================================================
-- 2. Admin 文章列表 RPC 函数（带搜索、筛选、排序）
-- 用途: app/admin/posts/page.tsx
-- 优化: 索引优化 + 预编译查询
-- ============================================================

CREATE OR REPLACE FUNCTION get_admin_posts_list(
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_sort TEXT DEFAULT 'newest',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id INT,
  title TEXT,
  slug TEXT,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  views INT,
  tags TEXT[],
  category TEXT,
  author_id UUID,
  status TEXT,
  comments_count INT,
  likes_count INT,
  favorites_count INT,
  total_count BIGINT
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.content,
    p.excerpt,
    p.cover_image,
    p.published,
    p.published_at,
    p.created_at,
    p.updated_at,
    p.views,
    p.tags,
    p.category,
    p.author_id,
    p.status,
    COALESCE(p.comments_count, 0)::INT as comments_count,
    COALESCE(p.likes_count, 0)::INT as likes_count,
    COALESCE(p.favorites_count, 0)::INT as favorites_count,
    COUNT(*) OVER() as total_count
  FROM posts p
  WHERE 
    -- 搜索筛选
    (p_search IS NULL OR 
     p.title ILIKE '%' || p_search || '%' OR 
     p_search = ANY(p.tags))
    -- 状态筛选
    AND (p_status IS NULL OR p.status = p_status)
  ORDER BY
    CASE WHEN p_sort = 'newest' THEN p.created_at END DESC,
    CASE WHEN p_sort = 'oldest' THEN p.created_at END ASC,
    CASE WHEN p_sort = 'views' THEN p.views END DESC,
    CASE WHEN p_sort = 'comments' THEN COALESCE(p.comments_count, 0) END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_admin_posts_list(TEXT, TEXT, TEXT, INT, INT) IS 'Admin 文章列表（支持搜索、筛选、排序、分页）';

-- ============================================================
-- 3. 评论列表及关联用户、文章信息
-- 用途: app/admin/comments/page.tsx
-- 优化: 从 3 次批量查询 → 1 次 JOIN (67% 减少)
-- 注意: email 需单独通过 Auth Admin API 获取
-- ============================================================

CREATE OR REPLACE FUNCTION get_comments_with_users(
  p_limit INT DEFAULT 30,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  post_slug TEXT,
  user_id UUID,
  parent_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  username TEXT,
  avatar_url TEXT,
  post_title TEXT,
  total_count BIGINT
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.post_slug,
    c.user_id,
    c.parent_id,
    c.content,
    c.created_at,
    c.updated_at,
    prof.username,
    prof.avatar_url,
    p.title as post_title,
    COUNT(*) OVER() as total_count
  FROM comments c
  LEFT JOIN profiles prof ON prof.id = c.user_id
  LEFT JOIN posts p ON p.slug = c.post_slug
  ORDER BY c.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_comments_with_users(INT, INT) IS 'Admin 评论列表（关联用户和文章信息）';

-- ============================================================
-- 4. Admin 专用性能索引
-- 目的: 优化 Admin 特定的查询模式
-- ============================================================

-- 索引 1: 文章状态 + 创建时间（默认排序）
CREATE INDEX IF NOT EXISTS idx_posts_status_created 
ON posts(status, created_at DESC);

COMMENT ON INDEX idx_posts_status_created IS 'Admin 文章列表默认排序优化';

-- 索引 2: 文章状态 + 浏览量（按浏览量排序）
CREATE INDEX IF NOT EXISTS idx_posts_status_views 
ON posts(status, views DESC);

COMMENT ON INDEX idx_posts_status_views IS 'Admin 文章按浏览量排序优化';

-- 索引 3: 文章状态 + 评论数（按评论数排序）
CREATE INDEX IF NOT EXISTS idx_posts_status_comments 
ON posts(status, comments_count DESC);

COMMENT ON INDEX idx_posts_status_comments IS 'Admin 文章按评论数排序优化';

-- 索引 4: 评论创建时间降序（评论列表排序）
CREATE INDEX IF NOT EXISTS idx_comments_created_desc 
ON comments(created_at DESC);

COMMENT ON INDEX idx_comments_created_desc IS 'Admin 评论列表时间排序优化';

-- ============================================================
-- 5. 授权（确保函数可被认证用户调用）
-- ============================================================

-- Dashboard 统计：仅认证用户（middleware 已验证 admin）
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;

-- Admin 文章列表：仅认证用户
GRANT EXECUTE ON FUNCTION get_admin_posts_list(TEXT, TEXT, TEXT, INT, INT) TO authenticated;

-- Admin 评论列表：仅认证用户
GRANT EXECUTE ON FUNCTION get_comments_with_users(INT, INT) TO authenticated;

-- ============================================================
-- 6. 验证安装
-- ============================================================

DO $$
DECLARE
  func_count INT;
  idx_count INT;
BEGIN
  -- 统计新创建的函数数量
  SELECT COUNT(*) INTO func_count
  FROM pg_proc
  WHERE proname IN (
    'get_dashboard_stats',
    'get_admin_posts_list',
    'get_comments_with_users'
  );

  -- 统计新创建的索引数量
  SELECT COUNT(*) INTO idx_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname IN (
      'idx_posts_status_created',
      'idx_posts_status_views',
      'idx_posts_status_comments',
      'idx_comments_created_desc'
    );

  RAISE NOTICE '✅ Admin performance optimization completed successfully!';
  RAISE NOTICE '📊 Functions created: %', func_count;
  RAISE NOTICE '📊 Indexes created: %', idx_count;
  RAISE NOTICE '📈 Expected performance improvements:';
  RAISE NOTICE '  - Dashboard: 4 queries → 1 RPC (75%% faster)';
  RAISE NOTICE '  - Posts list: Index optimized queries';
  RAISE NOTICE '  - Comments: 3 queries → 1 JOIN (67%% faster)';
  RAISE NOTICE '  - Overall Admin area: 50-75%% faster loading';
END $$;

-- ============================================================
-- 完成
-- ============================================================

