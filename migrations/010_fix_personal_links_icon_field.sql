-- =====================================================
-- Migration: Fix personal_links.icon Field Length
-- Description: Change icon from VARCHAR(50) to TEXT
-- Date: 2025-11-08
-- Issue: Cannot store Supabase Storage URLs (100+ chars)
-- Error Code: 22001 (string_data_right_truncation)
-- =====================================================

-- =====================================================
-- Background:
-- The personal_links.icon field was originally set to VARCHAR(50),
-- which is sufficient for Lucide icon names (e.g., "Github", "Mail"),
-- but too short for Supabase Storage URLs (~100+ characters).
-- This migration extends the field to TEXT type for consistency
-- with external_links table and to support custom image uploads.
-- =====================================================

BEGIN;

-- Step 1: Add migration comment for documentation
COMMENT ON TABLE public.personal_links IS 
  'Personal links displayed on /links page. Icon field upgraded to TEXT on 2025-11-08.';

-- Step 2: Alter column type from VARCHAR(50) to TEXT
-- This operation is safe and preserves all existing data
ALTER TABLE public.personal_links 
  ALTER COLUMN icon TYPE TEXT;

-- Step 3: Remove NOT NULL constraint for consistency with external_links
-- This allows links to exist without an icon (will show default icon in UI)
ALTER TABLE public.personal_links 
  ALTER COLUMN icon DROP NOT NULL;

-- Step 4: Add column comment for future reference
COMMENT ON COLUMN public.personal_links.icon IS 
  'Icon for the link. Can be either a Lucide icon name (e.g., "Github") or a full URL to a custom image (e.g., Supabase Storage URL). NULL displays default icon.';

-- Step 5: Verification query (for logging purposes)
DO $$
DECLARE
  v_data_type text;
  v_is_nullable text;
BEGIN
  SELECT data_type, is_nullable
  INTO v_data_type, v_is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'personal_links'
    AND column_name = 'icon';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Table: personal_links';
  RAISE NOTICE 'Column: icon';
  RAISE NOTICE 'New Type: %', v_data_type;
  RAISE NOTICE 'Nullable: %', v_is_nullable;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'You can now store:';
  RAISE NOTICE '  - Lucide icon names (e.g., "Github", "Mail")';
  RAISE NOTICE '  - Full image URLs (e.g., Supabase Storage URLs)';
  RAISE NOTICE '  - NULL values (will display default icon)';
  RAISE NOTICE '========================================';
END $$;

COMMIT;

-- =====================================================
-- Post-Migration Verification
-- =====================================================
-- Run the following queries to verify the migration:

-- 1. Check column definition
-- SELECT column_name, data_type, character_maximum_length, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'personal_links' AND column_name = 'icon';
-- Expected: data_type = 'text', is_nullable = 'YES'

-- 2. Check existing data (all should be preserved)
-- SELECT id, name, icon, 
--        CASE 
--          WHEN icon IS NULL THEN 'NULL (no icon)'
--          WHEN icon LIKE 'http%' THEN 'URL (custom image)'
--          ELSE 'Lucide icon name'
--        END AS icon_type,
--        LENGTH(icon) AS icon_length
-- FROM public.personal_links
-- ORDER BY created_at DESC;

-- =====================================================
-- Rollback (Emergency Only - Will Lose Data!)
-- =====================================================
-- If you need to rollback this migration (NOT RECOMMENDED):
-- ALTER TABLE public.personal_links ALTER COLUMN icon TYPE VARCHAR(50);
-- ALTER TABLE public.personal_links ALTER COLUMN icon SET NOT NULL;
-- WARNING: This will TRUNCATE any URLs longer than 50 characters!

-- =====================================================
-- Migration Complete!
-- =====================================================

