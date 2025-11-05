-- 修复外键关系：将 comments, likes, favorites 的 user_id 外键从 auth.users 改为 public.profiles
-- 执行日期：2025-11-02

-- ============================================
-- 步骤 1: 修复 comments 表的外键
-- ============================================

-- 1.1 删除现有的外键约束（如果存在）
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- 1.2 添加新的外键约束，引用 public.profiles
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- ============================================
-- 步骤 2: 修复 likes 表的外键
-- ============================================

-- 2.1 删除现有的外键约束（如果存在）
ALTER TABLE public.likes
DROP CONSTRAINT IF EXISTS likes_user_id_fkey;

-- 2.2 添加新的外键约束，引用 public.profiles
ALTER TABLE public.likes
ADD CONSTRAINT likes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- ============================================
-- 步骤 3: 修复 favorites 表的外键
-- ============================================

-- 3.1 删除现有的外键约束（如果存在）
ALTER TABLE public.favorites
DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

-- 3.2 添加新的外键约束，引用 public.profiles
ALTER TABLE public.favorites
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- ============================================
-- 验证外键关系
-- ============================================

-- 查询所有外键约束以验证修改
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('comments', 'likes', 'favorites')
ORDER BY tc.table_name, tc.constraint_name;

