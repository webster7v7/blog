-- ============================================================
-- Migration 005: 缓存优化 - RPC 函数
-- 目的: 解决 N+1 查询问题，优化数据获取性能
-- 日期: 2025-11-06
-- ============================================================

-- ============================================================
-- 1. 获取分类及文章数统计（解决 N+1 问题）
-- ============================================================

CREATE OR REPLACE FUNCTION get_categories_with_count()
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
  GROUP BY c.id, c.name, c.slug, c.description, c.color, c.icon, c.order_index, c.created_at
  ORDER BY c.order_index ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_categories_with_count() IS '获取所有分类及其文章数统计（单次查询，避免N+1）';

-- ============================================================
-- 2. 获取标签及文章数统计
-- ============================================================

CREATE OR REPLACE FUNCTION get_tags_with_count()
RETURNS TABLE (
  tag TEXT,
  count BIGINT
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unnest(tags) as tag,
    COUNT(*)::BIGINT as count
  FROM posts
  WHERE status = 'published'
  GROUP BY tag
  ORDER BY count DESC, tag ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_tags_with_count() IS '获取所有标签及其文章数统计';

-- ============================================================
-- 3. 获取文章列表（优化查询）
-- ============================================================

CREATE OR REPLACE FUNCTION get_posts_list(
  p_limit INT DEFAULT NULL,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id INT,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  views INT,
  tags TEXT[],
  category TEXT,
  comments_count INT,
  likes_count INT,
  favorites_count INT
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.cover_image,
    p.published,
    p.published_at,
    p.created_at,
    p.updated_at,
    p.views,
    p.tags,
    p.category,
    COALESCE(p.comments_count, 0)::INT as comments_count,
    COALESCE(p.likes_count, 0)::INT as likes_count,
    COALESCE(p.favorites_count, 0)::INT as favorites_count
  FROM posts p
  WHERE p.status = 'published'
  ORDER BY p.published_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_posts_list(INT, INT) IS '获取文章列表（支持分页）';

-- ============================================================
-- 4. 获取热门文章（按浏览量排序）
-- ============================================================

CREATE OR REPLACE FUNCTION get_hot_posts(p_limit INT DEFAULT 5)
RETURNS TABLE (
  id INT,
  title TEXT,
  slug TEXT,
  views INT,
  published_at TIMESTAMPTZ
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.views,
    p.published_at
  FROM posts p
  WHERE p.status = 'published'
  ORDER BY p.views DESC, p.published_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_hot_posts(INT) IS '获取热门文章（按浏览量排序）';

-- ============================================================
-- 5. 创建必要的索引（如果不存在）
-- ============================================================

-- 分类 + 状态组合索引
CREATE INDEX IF NOT EXISTS posts_category_status_idx 
ON posts(category, status) 
WHERE status = 'published';

-- 发布时间索引（用于排序）
CREATE INDEX IF NOT EXISTS posts_published_at_desc_idx 
ON posts(published_at DESC) 
WHERE status = 'published';

-- 浏览量索引（用于热门排序）
CREATE INDEX IF NOT EXISTS posts_views_desc_idx 
ON posts(views DESC) 
WHERE status = 'published';

-- Slug索引（用于快速查找）
CREATE INDEX IF NOT EXISTS posts_slug_idx 
ON posts(slug) 
WHERE status = 'published';

-- 标签GIN索引（用于标签查询）
CREATE INDEX IF NOT EXISTS posts_tags_gin_idx 
ON posts USING GIN(tags);

-- ============================================================
-- 6. 授权（确保函数可以被调用）
-- ============================================================

-- 授予匿名用户和认证用户执行权限
GRANT EXECUTE ON FUNCTION get_categories_with_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_tags_with_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_posts_list(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_hot_posts(INT) TO anon, authenticated;

-- ============================================================
-- 完成
-- ============================================================

-- 验证函数创建
DO $$
BEGIN
  RAISE NOTICE '✅ Cache optimization functions created successfully!';
  RAISE NOTICE '📊 Created functions:';
  RAISE NOTICE '  - get_categories_with_count()';
  RAISE NOTICE '  - get_tags_with_count()';
  RAISE NOTICE '  - get_posts_list(limit, offset)';
  RAISE NOTICE '  - get_hot_posts(limit)';
  RAISE NOTICE '📈 Created indexes for optimal query performance';
END $$;

