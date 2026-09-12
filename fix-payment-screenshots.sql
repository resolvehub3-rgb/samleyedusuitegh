-- Fix Payment Screenshots Storage Bucket and Policies
-- Run this in Supabase SQL Editor

-- 1. Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop ALL existing policies on objects table for this bucket
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE 'Payment screenshots%'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- 3. Create fresh policies
CREATE POLICY "Payment screenshots upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.school_id = (storage.foldername(name))[1]::uuid
      AND p.role IN ('admin', 'teacher', 'parent')
    )
  );

CREATE POLICY "Payment screenshots read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-screenshots'
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.school_id = (storage.foldername(name))[1]::uuid
        AND p.role IN ('admin', 'teacher', 'parent')
      )
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    )
  );

CREATE POLICY "Payment screenshots delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'payment-screenshots'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.school_id = (storage.foldername(name))[1]::uuid
      AND p.role IN ('admin', 'teacher', 'parent')
    )
  );
