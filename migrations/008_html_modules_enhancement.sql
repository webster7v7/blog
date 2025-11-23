-- HTML Modules Enhancement Migration
-- 添加分类、标签、链接类型等功能

-- 添加新字段
ALTER TABLE public.html_modules
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS link_type text DEFAULT 'modal',
  ADD COLUMN IF NOT EXISTS external_url text,
  ADD COLUMN IF NOT EXISTS cover_image text;

-- 为现有数据生成slug（使用id作为临时slug）
UPDATE public.html_modules
SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '/', '-'))
WHERE slug IS NULL;

-- 添加约束
ALTER TABLE public.html_modules
  ADD CONSTRAINT html_modules_slug_unique UNIQUE (slug);

ALTER TABLE public.html_modules
  ADD CONSTRAINT html_modules_link_type_check 
  CHECK (link_type IN ('modal', 'page', 'external'));

-- 设置slug为NOT NULL
ALTER TABLE public.html_modules
  ALTER COLUMN slug SET NOT NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_html_modules_category ON public.html_modules(category_id);
CREATE INDEX IF NOT EXISTS idx_html_modules_slug ON public.html_modules(slug);
CREATE INDEX IF NOT EXISTS idx_html_modules_link_type ON public.html_modules(link_type);
CREATE INDEX IF NOT EXISTS idx_html_modules_tags ON public.html_modules USING GIN(tags);

-- 为现有数据设置默认描述
UPDATE public.html_modules
SET description = SUBSTRING(content, 1, 150) || '...'
WHERE description IS NULL AND LENGTH(content) > 150;

UPDATE public.html_modules
SET description = content
WHERE description IS NULL AND LENGTH(content) <= 150;
