-- =============================================================================
-- FIX: Allow re-inviting users whose profile was deleted but auth still exists
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Find an existing auth user by email and return their ID
-- Used when admin re-invites a teacher/parent whose profile was deleted
CREATE OR REPLACE FUNCTION public.find_auth_user_by_email(p_email TEXT)
RETURNS TABLE (user_id UUID, user_email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE LOWER(au.email) = LOWER(p_email)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
