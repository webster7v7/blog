-- =====================================================
-- Migration: Projects Display System (Safe Version)
-- Description: Safe to run multiple times
-- Date: 2025-11-06
-- =====================================================

-- 1. Drop existing policies if they exist (safe cleanup)
DROP POLICY IF EXISTS "Anyone can view personal links" ON public.personal_links;
DROP POLICY IF EXISTS "Authenticated users can manage personal links" ON public.personal_links;
DROP POLICY IF EXISTS "Anyone can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON public.projects;

-- 2. Create personal_links table (IF NOT EXISTS)
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

-- 3. Create projects table (IF NOT EXISTS)
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

-- 4. Enable RLS (safe to run multiple times)
ALTER TABLE public.personal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for personal_links (fresh creation)
CREATE POLICY "Anyone can view personal links"
  ON public.personal_links FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage personal links"
  ON public.personal_links FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 6. Create RLS Policies for projects (fresh creation)
CREATE POLICY "Anyone can view published projects"
  ON public.projects FOR SELECT
  USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage projects"
  ON public.projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 7. Create indexes (IF NOT EXISTS)
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

-- 11. Create RPC functions for statistics (safe)
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Projects System migration completed successfully!';
  RAISE NOTICE '📦 Tables created: personal_links, projects';
  RAISE NOTICE '🔒 RLS policies configured';
  RAISE NOTICE '🎯 Ready to use!';
END $$;

