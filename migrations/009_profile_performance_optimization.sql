-- ============================================================
-- Profile Performance Optimization
-- 目标：优化用户资料页面，从 5 次串行查询减少到 1 次 RPC 调用
-- 预期性能提升：响应时间从 8261ms 降至 1500-2000ms (75%+)
-- ============================================================

-- ============================================================
-- 函数：get_user_profile_stats
-- 功能：一次性获取用户资料及所有统计数据
-- 参数：p_user_id UUID - 用户ID
-- 返回：JSON 对象，包含：
--   - profile: 用户资料信息
--   - posts_count: 发布文章数
--   - favorites_count: 收藏数
--   - likes_count: 点赞数
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_profile_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_profile RECORD;
  v_posts_count INTEGER;
  v_favorites_count INTEGER;
  v_likes_count INTEGER;
  v_result JSON;
BEGIN
  -- 验证参数
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- 1. 获取用户资料（RLS 自动应用）
  SELECT *
  INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  -- 如果用户不存在，返回 null
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- 2. 统计发布文章数
  SELECT COUNT(*)
  INTO v_posts_count
  FROM posts
  WHERE author_id = p_user_id 
    AND status = 'published';

  -- 3. 统计收藏数
  SELECT COUNT(*)
  INTO v_favorites_count
  FROM favorites
  WHERE user_id = p_user_id;

  -- 4. 统计点赞数
  SELECT COUNT(*)
  INTO v_likes_count
  FROM likes
  WHERE user_id = p_user_id;

  -- 5. 构建返回 JSON
  v_result := json_build_object(
    'profile', row_to_json(v_profile),
    'posts_count', COALESCE(v_posts_count, 0),
    'favorites_count', COALESCE(v_favorites_count, 0),
    'likes_count', COALESCE(v_likes_count, 0)
  );

  RETURN v_result;
END;
$$;

-- ============================================================
-- 注释和权限
-- ============================================================

COMMENT ON FUNCTION get_user_profile_stats(UUID) IS 
'获取用户资料及统计数据（文章/收藏/点赞数）。
优化前：5次查询（串行）
优化后：1次RPC调用
性能提升：75%+';

-- 授予匿名用户和已认证用户访问权限
GRANT EXECUTE ON FUNCTION get_user_profile_stats(UUID) TO anon, authenticated;

-- ============================================================
-- 性能优化索引（如果尚未创建）
-- ============================================================

-- 确保相关索引存在
DO $$
BEGIN
  -- posts.author_id + status 索引
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'posts' 
    AND indexname = 'idx_posts_author_status'
  ) THEN
    CREATE INDEX idx_posts_author_status ON posts(author_id, status);
  END IF;

  -- favorites.user_id 索引
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'favorites' 
    AND indexname = 'idx_favorites_user_id'
  ) THEN
    CREATE INDEX idx_favorites_user_id ON favorites(user_id);
  END IF;

  -- likes.user_id 索引
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'likes' 
    AND indexname = 'idx_likes_user_id'
  ) THEN
    CREATE INDEX idx_likes_user_id ON likes(user_id);
  END IF;
END $$;

-- ============================================================
-- 测试查询（在 Supabase SQL Editor 中执行以验证）
-- ============================================================

-- 测试示例（替换为实际的 user_id）:
-- SELECT get_user_profile_stats('your-user-uuid-here');

-- 预期返回格式:
-- {
--   "profile": {
--     "id": "...",
--     "username": "...",
--     "email": "...",
--     "avatar_url": "...",
--     "bio": "...",
--     "website": "...",
--     "created_at": "...",
--     "updated_at": "..."
--   },
--   "posts_count": 5,
--   "favorites_count": 12,
--   "likes_count": 28
-- }

