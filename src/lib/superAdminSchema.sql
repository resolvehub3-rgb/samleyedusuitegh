-- =============================================================================
-- SAMLEYEDUSUITE GHANA - SUPER ADMIN PLATFORM MIGRATION
-- Run this AFTER the main schema. Adds super_admin role, platform tables,
-- audit logging, platform announcements, and Super Admin RLS policies.
-- This file is idempotent — safe to run multiple times.
-- =============================================================================

-- 1. Extend user_role enum to include super_admin
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add status column to schools (if not exists)
DO $$ BEGIN
  ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'pending', 'deactivated'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS slug TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 3. Platform Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'boolean', 'number', 'json')),
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, description) VALUES
  ('platform_name', 'SamleyEduSuite Ghana', 'string', 'Platform display name'),
  ('platform_motto', 'Ghana''s Premier School Management SaaS', 'string', 'Platform tagline'),
  ('maintenance_mode', 'false', 'boolean', 'When enabled, normal users see maintenance page'),
  ('allow_school_registration', 'true', 'boolean', 'Allow new school signups'),
  ('max_schools', '0', 'number', 'Max schools (0 = unlimited)'),
  ('contact_email', 'support@samleyedusuite.com', 'string', 'Platform support email'),
  ('payment_enabled', 'true', 'boolean', 'Platform-wide payment processing enabled'),
  ('email_notifications', 'true', 'boolean', 'Email notification system status')
ON CONFLICT (setting_key) DO NOTHING;

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  school_name TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school_id ON public.audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- 5. Platform Announcements (school_id is nullable for platform-wide)
CREATE TABLE IF NOT EXISTS public.platform_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target TEXT DEFAULT 'all' CHECK (target IN ('all', 'school_admins', 'teachers', 'parents')),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Platform Notifications (for super admin)
CREATE TABLE IF NOT EXISTS public.platform_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_notifications_user_id ON public.platform_notifications(user_id);

-- 7. Contact Messages (from landing page form)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read);

-- =============================================================================
-- 8. SECURITY FUNCTIONS
-- =============================================================================

-- Check if current user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get all school IDs (for super admin platform-wide queries)
CREATE OR REPLACE FUNCTION public.get_all_school_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM public.schools;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Log an audit event
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_actor_id UUID DEFAULT NULL,
  p_actor_email TEXT DEFAULT NULL,
  p_actor_role TEXT DEFAULT NULL,
  p_school_id UUID DEFAULT NULL,
  p_school_name TEXT DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_entity TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    actor_id, actor_email, actor_role, school_id, school_name,
    action, entity, entity_id, description, metadata, ip_address
  ) VALUES (
    p_actor_id, p_actor_email, p_actor_role, p_school_id, p_school_name,
    p_action, p_entity, p_entity_id, p_description, p_metadata, p_ip_address
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER: Auto-create platform notification for super admin on new contact message
CREATE OR REPLACE FUNCTION public.notify_super_admin_on_contact_message()
RETURNS TRIGGER AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id
  FROM public.profiles
  WHERE role = 'super_admin'
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.platform_notifications (
    user_id, type, title, message, related_entity, related_entity_id, is_read
  ) VALUES (
    admin_user_id,
    'platform_activity',
    'New Contact Message',
    NEW.full_name || ' from ' || NEW.school_name || ' sent a message: ' || LEFT(NEW.message, 120),
    'contact_message',
    NEW.id,
    FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_super_admin_contact_message ON public.contact_messages;

CREATE TRIGGER trg_notify_super_admin_contact_message
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_super_admin_on_contact_message();

-- =============================================================================
-- 9. ROW LEVEL SECURITY — Enable RLS on all tables
-- =============================================================================

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 10. RLS POLICIES (each wrapped for idempotency)
-- =============================================================================

-- Contact Messages: anyone can insert
DO $$ BEGIN
  CREATE POLICY "Anyone can insert contact_messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Contact Messages: super admins can read
DO $$ BEGIN
  CREATE POLICY "Super admin read contact_messages" ON public.contact_messages
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Contact Messages: super admins can update
DO $$ BEGIN
  CREATE POLICY "Super admin update contact_messages" ON public.contact_messages
    FOR UPDATE USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Contact Messages: super admins can delete
DO $$ BEGIN
  CREATE POLICY "Super admin delete contact_messages" ON public.contact_messages
    FOR DELETE USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Platform Settings
DO $$ BEGIN
  CREATE POLICY "Super admin read platform_settings" ON public.platform_settings
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin update platform_settings" ON public.platform_settings
    FOR UPDATE USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin insert platform_settings" ON public.platform_settings
    FOR INSERT WITH CHECK (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Audit Logs
DO $$ BEGIN
  CREATE POLICY "Super admin read audit_logs" ON public.audit_logs
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "System insert audit_logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Platform Announcements
DO $$ BEGIN
  CREATE POLICY "Public read published platform_announcements" ON public.platform_announcements
    FOR SELECT USING (is_published = true OR public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin insert platform_announcements" ON public.platform_announcements
    FOR INSERT WITH CHECK (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin update platform_announcements" ON public.platform_announcements
    FOR UPDATE USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin delete platform_announcements" ON public.platform_announcements
    FOR DELETE USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Platform Notifications
DO $$ BEGIN
  CREATE POLICY "Users read own platform_notifications" ON public.platform_notifications
    FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "System insert platform_notifications" ON public.platform_notifications
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users update own platform_notifications" ON public.platform_notifications
    FOR UPDATE USING (user_id = auth.uid() OR public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin delete platform_notifications" ON public.platform_notifications
    FOR DELETE USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 11. SUPER ADMIN RLS BYPASS FOR EXISTING TABLES
-- =============================================================================

DO $$ BEGIN
  CREATE POLICY "Super admin read all schools" ON public.schools
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin update schools" ON public.schools
    FOR UPDATE USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all profiles" ON public.profiles
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin update profiles" ON public.profiles
    FOR UPDATE USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all classes" ON public.classes
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all subjects" ON public.subjects
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all students" ON public.students
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all attendance" ON public.attendance
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all payments" ON public.payments
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all announcements" ON public.announcements
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin insert announcements" ON public.announcements
    FOR INSERT WITH CHECK (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all notifications" ON public.notifications
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all parent_students" ON public.parent_students
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all fee_structures" ON public.fee_structures
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all school_settings" ON public.school_settings
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all assignments" ON public.class_teacher_assignments
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all results" ON public.student_results
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all terminal_reports" ON public.terminal_reports
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all reviews" ON public.teacher_reviews
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all feedback" ON public.parent_feedback
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admin read all invitations" ON public.user_invitations
    FOR SELECT USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 12. REALTIME PUBLICATIONS (wrapped for idempotency)
-- =============================================================================

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_settings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_announcements;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.schools;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
