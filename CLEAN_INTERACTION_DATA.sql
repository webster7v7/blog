-- 清空互动数据表中的测试数据
-- 这是必要的，因为修改外键后，旧的 user_id 引用不再有效
-- 执行日期：2025-11-02

-- ============================================
-- 清空所有互动数据
-- ============================================

-- 1. 清空 comments 表
TRUNCATE TABLE public.comments CASCADE;

-- 2. 清空 likes 表
TRUNCATE TABLE public.likes CASCADE;

-- 3. 清空 favorites 表
TRUNCATE TABLE public.favorites CASCADE;

-- ============================================
-- 重置 posts 表的计数器
-- ============================================

-- 将所有文章的互动计数重置为 0
UPDATE public.posts
SET 
  comments_count = 0,
  likes_count = 0,
  favorites_count = 0;

-- ============================================
-- 验证清空结果
-- ============================================

-- 检查各表的数据量
SELECT 
  'comments' AS table_name, 
  COUNT(*) AS row_count 
FROM public.comments
UNION ALL
SELECT 
  'likes' AS table_name, 
  COUNT(*) AS row_count 
FROM public.likes
UNION ALL
SELECT 
  'favorites' AS table_name, 
  COUNT(*) AS row_count 
FROM public.favorites;

-- 检查 posts 表的计数器
SELECT 
  slug, 
  comments_count, 
  likes_count, 
  favorites_count 
FROM public.posts;

