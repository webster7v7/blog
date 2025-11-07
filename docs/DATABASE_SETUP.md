# 数据库设置脚本

## 🚀 快速开始

请在 Supabase Dashboard 的 SQL Editor 中依次执行以下脚本。

访问: https://supabase.com/dashboard/project/gagxhuubqmqslwkzndxu/sql/new

---

## 📋 Migration 1: Profiles 表（用户资料）

```sql
-- 创建 profiles 表（用户资料扩展）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 策略：所有人可以查看资料
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- 策略：用户可以插入自己的资料
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 策略：用户可以更新自己的资料
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建函数：新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器：用户注册时自动创建 profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 📋 Migration 2: 更新 Posts 表（添加作者信息）

```sql
-- 为 posts 表添加作者相关字段
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS favorites_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- 创建索引
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_status_idx ON public.posts(status);
```

---

## 📋 Migration 3: Comments 表（评论系统）

```sql
-- 创建 comments 表
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS comments_post_slug_idx ON public.comments(post_slug);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at DESC);

-- 启用 RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 策略：所有人可以查看评论
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

-- 策略：认证用户可以创建评论
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 策略：用户可以更新自己的评论
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- 策略：用户可以删除自己的评论
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- 触发器：自动更新 comments 的 updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 触发器：自动更新文章评论数
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE slug = NEW.post_slug;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
    WHERE slug = OLD.post_slug;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();
```

---

## 📋 Migration 4: Likes 表（点赞）

```sql
-- 创建 likes 表
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_slug, user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS likes_post_slug_idx ON public.likes(post_slug);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);

-- 启用 RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 策略：所有人可以查看点赞
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

-- 策略：认证用户可以点赞
CREATE POLICY "Authenticated users can like posts"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 策略：用户可以取消自己的点赞
CREATE POLICY "Users can unlike own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- 触发器：自动更新文章点赞数
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE slug = NEW.post_slug;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE slug = OLD.post_slug;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_likes_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();
```

---

## 📋 Migration 5: Favorites 表（收藏）

```sql
-- 创建 favorites 表
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_slug, user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS favorites_post_slug_idx ON public.favorites(post_slug);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);

-- 启用 RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 策略：所有人可以查看收藏（用于统计）
CREATE POLICY "Favorites are viewable by everyone"
  ON public.favorites FOR SELECT
  USING (true);

-- 策略：认证用户可以收藏
CREATE POLICY "Authenticated users can favorite posts"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 策略：用户可以取消自己的收藏
CREATE POLICY "Users can unfavorite own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 触发器：自动更新文章收藏数
CREATE OR REPLACE FUNCTION update_post_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET favorites_count = COALESCE(favorites_count, 0) + 1
    WHERE slug = NEW.post_slug;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
    WHERE slug = OLD.post_slug;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_favorites_count
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_post_favorites_count();
```

---

## 📋 Migration 6: 辅助函数

```sql
-- 检查是否是管理员
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户统计信息
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  posts_count BIGINT,
  comments_count BIGINT,
  likes_received BIGINT,
  favorites_received BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.posts WHERE author_id = user_uuid AND status = 'published'),
    (SELECT COUNT(*) FROM public.comments WHERE user_id = user_uuid),
    (SELECT COALESCE(SUM(likes_count), 0) FROM public.posts WHERE author_id = user_uuid),
    (SELECT COALESCE(SUM(favorites_count), 0) FROM public.posts WHERE author_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ✅ 验证安装

执行完所有脚本后，运行以下查询验证：

```sql
-- 查看所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 应该看到: comments, favorites, likes, posts, profiles

-- 查看 profiles 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles';
```

---

---

## 📋 Migration 7: 设置管理员权限

**重要**: 创建第一个管理员账号后，执行以下SQL将该用户设置为管理员。

```sql
-- 方法1: 通过邮箱设置管理员
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your@email.com'
);

-- 方法2: 通过用户ID设置管理员
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'your-user-id-here';

-- 验证管理员设置
SELECT 
  p.id,
  p.username,
  p.role,
  u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';
```

**注意**: 请将 `your@email.com` 替换为您的实际邮箱地址。

---

## 🎉 完成！

数据库设置完成后，您的 Webster 博客将支持：

✅ 用户认证与资料管理  
✅ 评论系统  
✅ 点赞功能  
✅ 收藏功能  
✅ 文章作者管理  
✅ 完整的权限控制（RLS）  
✅ 管理员后台

### **首次使用步骤**

1. 注册一个账号
2. 执行 Migration 7 将该账号设置为管理员
3. 访问 `/admin` 进入后台管理
4. 开始创建你的第一篇文章！

现在可以测试注册、登录和其他功能了！

