# 🚀 快速设置指南 - 项目展示系统

## ⚠️ 当前问题

访问 `/admin/projects` 和 `/admin/personal-links` 显示 **404 错误**

**原因**：数据库表还未创建

## ✅ 立即解决（3 步）

### 步骤 1：打开 Supabase SQL Editor

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单 **SQL Editor**

### 步骤 2：执行数据库迁移脚本

**方法 A：直接复制粘贴（推荐）**

复制以下完整 SQL 脚本并在 SQL Editor 中执行：

```sql
-- =====================================================
-- Migration: Projects Display System (Safe Version)
-- This script is safe to run multiple times
-- =====================================================

-- 1. Clean up existing policies
DROP POLICY IF EXISTS "Anyone can view personal links" ON public.personal_links;
DROP POLICY IF EXISTS "Authenticated users can manage personal links" ON public.personal_links;
DROP POLICY IF EXISTS "Anyone can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON public.projects;

-- 2. Create personal_links table
CREATE TABLE IF NOT EXISTS public.personal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  icon VARCHAR(255),
  file_url TEXT,
  qr_code_url TEXT,
  web_url TEXT,
  tags TEXT[],
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.personal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for personal_links (fresh)
CREATE POLICY "Anyone can view personal links"
  ON public.personal_links FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage personal links"
  ON public.personal_links FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 6. Create RLS Policies for projects (fresh)
CREATE POLICY "Anyone can view published projects"
  ON public.projects FOR SELECT
  USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage projects"
  ON public.projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_personal_links_order ON public.personal_links(order_index);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_order ON public.projects(order_index);

-- 8. Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Drop and recreate triggers (safe)
DROP TRIGGER IF EXISTS update_personal_links_updated_at ON public.personal_links;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;

CREATE TRIGGER update_personal_links_updated_at
  BEFORE UPDATE ON public.personal_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert sample data (only if not exists)
INSERT INTO public.personal_links (name, icon, url, description, order_index)
SELECT 'GitHub', 'Github', 'https://github.com/yourusername', '我的开源项目', 1
WHERE NOT EXISTS (SELECT 1 FROM public.personal_links WHERE name = 'GitHub');

INSERT INTO public.personal_links (name, icon, url, description, order_index)
SELECT '邮箱', 'Mail', 'mailto:your@email.com', '联系我', 2
WHERE NOT EXISTS (SELECT 1 FROM public.personal_links WHERE name = '邮箱');

INSERT INTO public.personal_links (name, icon, url, description, order_index)
SELECT '微信公众号', 'MessageCircle', '#', '关注我的公众号', 3
WHERE NOT EXISTS (SELECT 1 FROM public.personal_links WHERE name = '微信公众号');

-- 11. Create RPC functions for statistics
CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects SET views = views + 1 WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_project_downloads(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects SET downloads = downloads + 1 WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

点击 **Run** 按钮执行。

**方法 B：使用文件（备选）**

如果上面的脚本太长，也可以直接使用项目中的文件：

1. 打开 `migrations/004_projects_system_safe.sql`
2. 复制全部内容
3. 粘贴到 Supabase SQL Editor
4. 点击 **Run** 执行

### 步骤 3：验证结果

执行成功后：

1. **刷新页面**：回到 `http://localhost:3000/admin/projects`
2. **应该能看到**：项目管理界面（即使是空的列表）
3. **点击 "添加项目"**：开始添加你的第一个项目

## 📦 接下来（可选但推荐）

### 创建 Storage Bucket（用于文件上传）

1. 在 Supabase Dashboard 中点击 **Storage**
2. 点击 **Create Bucket**
3. 名称：`project-files`
4. 勾选 **Public bucket**
5. 点击 **Create**

### 配置 Storage RLS 策略

在 Storage > project-files > Policies 中添加：

```sql
-- 允许所有人读取
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'project-files' );

-- 允许认证用户上传
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

-- 允许认证用户删除
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);
```

## ✅ 完成！

数据库设置完成后：

- ✅ `/admin/projects` - 可以管理项目
- ✅ `/admin/personal-links` - 可以管理个人链接
- ✅ `/projects` - 前台展示项目
- ✅ `/links` - 前台展示链接

## 🆘 遇到问题？

### "policy already exists" 错误 ✅ 已解决
如果之前运行过旧版本的脚本，可能会看到：
```
ERROR: policy "Anyone can view personal links" already exists
```

**解决方法**：使用上面的**新版安全脚本**，它会：
- 先删除已存在的策略
- 然后重新创建所有对象
- 可以安全地重复执行多次

### 表已存在错误
如果看到 "table already exists" 错误，说明表已经创建，脚本会自动跳过，这是正常的。

### 权限错误
确保你有 Supabase 项目的管理员权限。

### 仍然 404
1. 确认 SQL 执行成功（无红色错误提示）
2. 刷新浏览器页面
3. 清除浏览器缓存
4. 重启开发服务器

---

**完整文档**：查看 `PROJECTS_SYSTEM_SETUP.md` 了解更多详情

