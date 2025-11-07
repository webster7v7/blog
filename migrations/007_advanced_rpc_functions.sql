-- ============================================================
-- Migration 007: 高级 RPC 函数优化
-- 目的: 消除剩余的 N+1 查询问题，提升查询效率
-- 日期: 2025-11-06
-- 依赖: Migration 006 (性能索引)
-- ============================================================

-- ============================================================
-- 1. 获取单个分类及文章数（消除 getCategoryBySlug 的 2 次查询）
-- 用途: lib/categories.ts 中的 getCategoryBySlug() 函数
-- 优化: 从 2 次查询减少到 1 次 RPC 调用
-- ============================================================

CREATE OR REPLACE FUNCTION get_category_with_count(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  color TEXT,
  icon TEXT,
  order_index INT,
  posts_count BIGINT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.color,
    c.icon,
    c.order_index,
    COUNT(p.id)::BIGINT as posts_count,
    c.created_at
  FROM categories c
  LEFT JOIN posts p ON p.category = c.slug AND p.status = 'published'
  WHERE c.slug = p_slug
  GROUP BY c.id, c.name, c.slug, c.description, c.color, c.icon, c.order_index, c.created_at;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_category_with_count(TEXT) IS '获取单个分类及其文章数统计（单次查询，消除 N+1）';

-- ============================================================
-- 2. 批量获取文章的互动统计（点赞、收藏、评论）
-- 用途: 为未来的批量统计查询提供基础
-- 优化: 一次性获取多篇文章的所有统计数据
-- ============================================================

CREATE OR REPLACE FUNCTION get_posts_stats(p_slugs TEXT[])
RETURNS TABLE (
  slug TEXT,
  likes_count INT,
  favorites_count INT,
  comments_count INT
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.slug,
    COALESCE(COUNT(DISTINCT l.id), 0)::INT as likes_count,
    COALESCE(COUNT(DISTINCT f.id), 0)::INT as favorites_count,
    COALESCE(COUNT(DISTINCT c.id), 0)::INT as comments_count
  FROM posts p
  LEFT JOIN likes l ON l.post_slug = p.slug
  LEFT JOIN favorites f ON f.post_slug = p.slug
  LEFT JOIN comments c ON c.post_slug = p.slug
  WHERE p.slug = ANY(p_slugs)
  GROUP BY p.slug;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_posts_stats(TEXT[]) IS '批量获取文章的互动统计（点赞、收藏、评论数）';

-- ============================================================
-- 3. 获取文章及其相邻文章（优化文章页面导航）
-- 用途: 优化文章详情页的上一篇/下一篇导航
-- 优化: 从 3 次查询减少到 1 次 RPC 调用
-- ============================================================

CREATE OR REPLACE FUNCTION get_post_with_adjacent(p_slug TEXT)
RETURNS TABLE (
  current_post_id INT,
  current_post_slug TEXT,
  current_post_published_at TIMESTAMPTZ,
  prev_post_id INT,
  prev_post_slug TEXT,
  prev_post_title TEXT,
  prev_post_excerpt TEXT,
  next_post_id INT,
  next_post_slug TEXT,
  next_post_title TEXT,
  next_post_excerpt TEXT
)
SECURITY DEFINER
AS $$
DECLARE
  current_published_at TIMESTAMPTZ;
BEGIN
  -- 获取当前文章的发布时间
  SELECT published_at INTO current_published_at
  FROM posts
  WHERE slug = p_slug AND status = 'published';

  -- 如果文章不存在，返回空结果
  IF current_published_at IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH current AS (
    SELECT id, slug, published_at
    FROM posts
    WHERE slug = p_slug AND status = 'published'
  ),
  prev AS (
    SELECT id, slug, title, excerpt
    FROM posts
    WHERE status = 'published' 
      AND published_at < current_published_at
    ORDER BY published_at DESC
    LIMIT 1
  ),
  next AS (
    SELECT id, slug, title, excerpt
    FROM posts
    WHERE status = 'published' 
      AND published_at > current_published_at
    ORDER BY published_at ASC
    LIMIT 1
  )
  SELECT 
    current.id,
    current.slug,
    current.published_at,
    prev.id,
    prev.slug,
    prev.title,
    prev.excerpt,
    next.id,
    next.slug,
    next.title,
    next.excerpt
  FROM current
  LEFT JOIN prev ON TRUE
  LEFT JOIN next ON TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_post_with_adjacent(TEXT) IS '获取文章及其相邻文章（上一篇/下一篇）';

-- ============================================================
-- 4. 授权（确保函数可以被调用）
-- ============================================================

-- 授予匿名用户和认证用户执行权限
GRANT EXECUTE ON FUNCTION get_category_with_count(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_posts_stats(TEXT[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_post_with_adjacent(TEXT) TO anon, authenticated;

-- ============================================================
-- 5. 验证函数创建
-- ============================================================

DO $$
DECLARE
  func_count INT;
BEGIN
  -- 统计新创建的函数数量
  SELECT COUNT(*) INTO func_count
  FROM pg_proc
  WHERE proname IN (
    'get_category_with_count',
    'get_posts_stats',
    'get_post_with_adjacent'
  );

  RAISE NOTICE '✅ Advanced RPC functions created successfully!';
  RAISE NOTICE '📊 Total functions created: %', func_count;
  RAISE NOTICE '📈 Query optimization:';
  RAISE NOTICE '  - get_category_with_count: 2 queries → 1 RPC (50%% reduction)';
  RAISE NOTICE '  - get_posts_stats: N queries → 1 RPC (N+1 eliminated)';
  RAISE NOTICE '  - get_post_with_adjacent: 3 queries → 1 RPC (67%% reduction)';
END $$;

-- ============================================================
-- 完成
-- ============================================================

