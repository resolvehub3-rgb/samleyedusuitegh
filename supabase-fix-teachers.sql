-- =============================================================================
-- FIX: Teachers & Parents can't login after admin creates their account
-- Run this ENTIRE block in Supabase SQL Editor
-- =============================================================================

-- 1. Auto-confirm all new signups (so manual credential sharing works)
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = NEW.id
    AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_confirm_user ON auth.users;
CREATE TRIGGER trg_auto_confirm_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_new_user();

-- 2. Admin helper: create/update profiles bypassing RLS
CREATE OR REPLACE FUNCTION public.admin_create_profile(
  p_id UUID,
  p_school_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_role TEXT,
  p_gender TEXT DEFAULT 'Male',
  p_qualification TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT TRUE,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (id, school_id, full_name, email, phone, role, gender, qualification, is_active, avatar_url)
  VALUES (p_id, p_school_id, p_full_name, p_email, p_phone, p_role::public.user_role, p_gender, p_qualification, p_is_active, p_avatar_url)
  ON CONFLICT (id) DO UPDATE SET
    school_id = EXCLUDED.school_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    gender = EXCLUDED.gender,
    qualification = EXCLUDED.qualification,
    is_active = EXCLUDED.is_active,
    avatar_url = EXCLUDED.avatar_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fix ALL existing users: confirm emails + create missing profiles
-- This fixes teachers/parents who were invited but can't login

-- 3a. Confirm all unconfirmed users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 3b. Create profiles for auth users who have NO profile row
-- (Teachers get linked to the first school in the system)
INSERT INTO public.profiles (id, school_id, email, full_name, phone, role, gender, is_active)
SELECT
  au.id,
  (SELECT id FROM public.schools ORDER BY created_at LIMIT 1) AS school_id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) AS full_name,
  COALESCE(au.raw_user_meta_data->>'phone', '') AS phone,
  COALESCE(au.raw_user_meta_data->>'role', 'teacher')::public.user_role AS role,
  'Male' AS gender,
  TRUE AS is_active
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
  AND au.email IS NOT NULL
  AND (SELECT id FROM public.schools LIMIT 1) IS NOT NULL;
