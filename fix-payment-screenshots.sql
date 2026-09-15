-- Auto-create payment-screenshots bucket if missing
-- Run this ONCE in Supabase SQL Editor

-- 1. Create a SECURITY DEFINER function that creates the bucket
CREATE OR REPLACE FUNCTION public.ensure_payment_screenshots_bucket()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create bucket as public if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'payment-screenshots',
    'payment-screenshots',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  )
  ON CONFLICT (id) DO UPDATE SET public = true;
END;
$$;

-- Allow any authenticated user to call this function
GRANT EXECUTE ON FUNCTION public.ensure_payment_screenshots_bucket() TO authenticated;

-- 2. Create bucket
SELECT public.ensure_payment_screenshots_bucket();

-- 3. Drop ALL existing policies on objects table for this bucket
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schema = 'storage' AND policyname LIKE 'Payment screenshots%'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- 4. Create fresh RLS policies
CREATE POLICY "Payment screenshots upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Payment screenshots read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-screenshots'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Payment screenshots delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'payment-screenshots'
    AND auth.uid() IS NOT NULL
  );
