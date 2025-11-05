-- ============================================
-- External Links Navigation Feature
-- Migration Script for Supabase
-- ============================================

-- ============================================
-- Step 1: Create external_links Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.external_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Step 2: Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_external_links_order 
  ON public.external_links("order");

CREATE INDEX IF NOT EXISTS idx_external_links_visible 
  ON public.external_links(is_visible);

CREATE INDEX IF NOT EXISTS idx_external_links_order_visible 
  ON public.external_links("order", is_visible);

-- ============================================
-- Step 3: Enable Row Level Security
-- ============================================

ALTER TABLE public.external_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 4: Create RLS Policies
-- ============================================

-- Policy 1: Anyone can view visible external links
DROP POLICY IF EXISTS "Anyone can view visible external links" ON public.external_links;
CREATE POLICY "Anyone can view visible external links"
  ON public.external_links
  FOR SELECT
  USING (is_visible = true);

-- Policy 2: Admins can do everything with external links
DROP POLICY IF EXISTS "Admins can do everything with external links" ON public.external_links;
CREATE POLICY "Admins can do everything with external links"
  ON public.external_links
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- Step 5: Create Trigger Function for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_external_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 6: Create Trigger
-- ============================================

DROP TRIGGER IF EXISTS trigger_external_links_updated_at ON public.external_links;
CREATE TRIGGER trigger_external_links_updated_at
  BEFORE UPDATE ON public.external_links
  FOR EACH ROW
  EXECUTE FUNCTION update_external_links_updated_at();

-- ============================================
-- Step 7: Insert Test Data
-- ============================================

INSERT INTO public.external_links (name, url, icon, "order", is_visible) VALUES
  ('GitHub', 'https://github.com', 'Github', 1, true),
  ('掘金', 'https://juejin.cn', 'Gem', 2, true),
  ('Stack Overflow', 'https://stackoverflow.com', 'Code', 3, true),
  ('MDN Web Docs', 'https://developer.mozilla.org', 'Book', 4, true),
  ('CSDN', 'https://www.csdn.net', 'BookOpen', 5, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Migration Complete!
-- ============================================

-- Verify the setup:
-- SELECT * FROM public.external_links ORDER BY "order";

