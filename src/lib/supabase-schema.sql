-- ==============================================================================
-- SAMLEYEDUSUITE GHANA - PRODUCTION-GRADE SCHOOL MANAGEMENT SYSTEM SAAS
-- POSTGRESQL SCHEMA, ROW LEVEL SECURITY (RLS), & GHANAIAN CURRICULUM SEEDING
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/oswxgbvfgwrqlhbmntdi/sql/new
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'paid', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE announcement_audience AS ENUM ('all', 'teachers', 'parents', 'class');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE feedback_status AS ENUM ('open', 'in_review', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 3. CORE MULTI-TENANT TABLES
-- ==============================================================================

-- Schools (Tenant Registry)
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,
  motto TEXT,
  logo_url TEXT,
  address TEXT,
  region TEXT DEFAULT 'Greater Accra',
  district TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School Settings
CREATE TABLE IF NOT EXISTS public.school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  active_academic_year TEXT DEFAULT '2025/2026',
  active_term TEXT DEFAULT 'Term 1',
  currency TEXT DEFAULT 'GHS',
  class_score_weight NUMERIC(5,2) DEFAULT 30.00,
  exam_score_weight NUMERIC(5,2) DEFAULT 70.00,
  momo_number TEXT,
  momo_merchant_name TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_branch TEXT,
  grading_scale JSONB DEFAULT '[
    {"grade":"1","min_score":80,"max_score":100,"remark":"Excellent / Distinction"},
    {"grade":"2","min_score":70,"max_score":79,"remark":"Very Good"},
    {"grade":"3","min_score":65,"max_score":69,"remark":"Good"},
    {"grade":"4","min_score":60,"max_score":64,"remark":"Credit"},
    {"grade":"5","min_score":55,"max_score":59,"remark":"Credit"},
    {"grade":"6","min_score":50,"max_score":54,"remark":"Pass"},
    {"grade":"7","min_score":45,"max_score":49,"remark":"Weak"},
    {"grade":"8","min_score":40,"max_score":44,"remark":"Very Weak"},
    {"grade":"9","min_score":0,"max_score":39,"remark":"Fail"}
  ]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_school_settings UNIQUE (school_id)
);

-- User Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  avatar_url TEXT,
  gender TEXT DEFAULT 'Male',
  address TEXT,
  qualification TEXT,
  employment_status TEXT DEFAULT 'Full-time',
  is_active BOOLEAN DEFAULT TRUE,
  must_reset_password BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes (Levels from Kindergarten to Junior High)
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section TEXT DEFAULT 'A',
  stage TEXT NOT NULL CHECK (stage IN ('Kindergarten', 'Primary', 'Junior High')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  is_core BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class Teacher Assignments
CREATE TABLE IF NOT EXISTS public.class_teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  is_class_teacher BOOLEAN DEFAULT FALSE,
  is_authorized_reports BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_class_teacher_year UNIQUE (class_id, teacher_id, academic_year)
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  admission_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  other_names TEXT,
  date_of_birth DATE,
  gender TEXT NOT NULL,
  current_class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  guardian_address TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_admission_no UNIQUE (school_id, admission_number)
);

-- Parent-Student Relationships
CREATE TABLE IF NOT EXISTS public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'Parent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_parent_student UNIQUE (parent_id, student_id)
);

-- Daily Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  remarks TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_student_daily_attendance UNIQUE (student_id, date)
);

-- Student Results / Continuous Assessment (30% Class / 70% Exam)
CREATE TABLE IF NOT EXISTS public.student_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  class_score NUMERIC(5,2) DEFAULT 0.00 CHECK (class_score >= 0 AND class_score <= 100),
  exam_score NUMERIC(5,2) DEFAULT 0.00 CHECK (exam_score >= 0 AND exam_score <= 100),
  total_score NUMERIC(5,2) GENERATED ALWAYS AS (class_score + exam_score) STORED,
  grade TEXT,
  remark TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_student_subject_term UNIQUE (school_id, student_id, class_id, subject_id, academic_year, term)
);

-- Terminal Report Cards
CREATE TABLE IF NOT EXISTS public.terminal_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  total_score NUMERIC(7,2) DEFAULT 0.00,
  average_score NUMERIC(5,2) DEFAULT 0.00,
  position TEXT,
  attendance_present INTEGER DEFAULT 0,
  attendance_total INTEGER DEFAULT 0,
  conduct TEXT,
  attitude TEXT,
  interest TEXT,
  class_teacher_remarks TEXT,
  head_teacher_remarks TEXT,
  promotion_status TEXT,
  next_term_begins DATE,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_student_terminal_report UNIQUE (school_id, student_id, academic_year, term)
);

-- Fee Structures
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  is_compulsory BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (Ghanaian Cedis GHS, Mobile Money, Bank)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  purpose TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_reference TEXT,
  status payment_status DEFAULT 'pending',
  notes TEXT,
  paid_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_school_invoice UNIQUE (school_id, invoice_number)
);

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience announcement_audience DEFAULT 'all',
  target_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  expires_at DATE,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher Reviews (by linked parents)
CREATE TABLE IF NOT EXISTS public.teacher_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent Feedback / Concerns
CREATE TABLE IF NOT EXISTS public.parent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'academic',
  status feedback_status DEFAULT 'open',
  admin_response TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_record_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Invitations
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. AUTO-CONFIRM NEW USERS (required for manual account creation flow)
-- ==============================================================================

-- When admin creates accounts via signUp(), Supabase requires email
-- confirmation by default. This trigger auto-confirms users immediately
-- so they can log in with the credentials the admin shares manually.
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

-- ==============================================================================
-- 5. AUTOMATIC GHANAIAN CURRICULUM SEEDING TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_school_seed()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Insert default school settings
  INSERT INTO public.school_settings (school_id)
  VALUES (NEW.id)
  ON CONFLICT (school_id) DO NOTHING;

  -- 2. Seed standard Ghanaian classes (KG 1 to JHS 3)
  INSERT INTO public.classes (school_id, name, section, stage, order_index) VALUES
    (NEW.id, 'Kindergarten 1', 'A', 'Kindergarten', 1),
    (NEW.id, 'Kindergarten 2', 'A', 'Kindergarten', 2),
    (NEW.id, 'Basic 1', 'A', 'Primary', 3),
    (NEW.id, 'Basic 2', 'A', 'Primary', 4),
    (NEW.id, 'Basic 3', 'A', 'Primary', 5),
    (NEW.id, 'Basic 4', 'A', 'Primary', 6),
    (NEW.id, 'Basic 5', 'A', 'Primary', 7),
    (NEW.id, 'Basic 6', 'A', 'Primary', 8),
    (NEW.id, 'JHS 1', 'A', 'Junior High', 9),
    (NEW.id, 'JHS 2', 'A', 'Junior High', 10),
    (NEW.id, 'JHS 3', 'A', 'Junior High', 11)
  ON CONFLICT DO NOTHING;

  -- 3. Seed standard Ghanaian basic curriculum subjects
  INSERT INTO public.subjects (school_id, name, code, is_core) VALUES
    (NEW.id, 'English Language', 'ENG', TRUE),
    (NEW.id, 'Mathematics', 'MATH', TRUE),
    (NEW.id, 'Integrated Science', 'SCI', TRUE),
    (NEW.id, 'Social Studies', 'SOC', TRUE),
    (NEW.id, 'Information & Communication Technology (ICT)', 'ICT', TRUE),
    (NEW.id, 'Religious and Moral Education (RME)', 'RME', TRUE),
    (NEW.id, 'Creative Arts & Design', 'CAD', TRUE),
    (NEW.id, 'Ghanaian Language & Culture', 'GHL', TRUE),
    (NEW.id, 'French Language', 'FRN', FALSE),
    (NEW.id, 'Physical and Health Education (PHE)', 'PHE', FALSE)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_seed_new_school ON public.schools;
CREATE TRIGGER trg_seed_new_school
AFTER INSERT ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_school_seed();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminal_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's school_id
CREATE OR REPLACE FUNCTION public.current_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Schools: Anyone authenticated or registering can read/insert
CREATE POLICY "Public read schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Public insert schools" ON public.schools FOR INSERT WITH CHECK (true);
CREATE POLICY "School admins can update school" ON public.schools FOR UPDATE USING (
  id = public.current_user_school_id()
);

-- Profiles: Authenticated users can insert their own profile and view school members
CREATE POLICY "Profiles select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR school_id = public.current_user_school_id());
CREATE POLICY "Profiles delete" ON public.profiles FOR DELETE USING (school_id = public.current_user_school_id());

-- School Settings
CREATE POLICY "School settings select" ON public.school_settings FOR SELECT USING (true);
CREATE POLICY "School settings insert" ON public.school_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "School settings update" ON public.school_settings FOR UPDATE USING (school_id = public.current_user_school_id());

-- Classes
CREATE POLICY "Classes access" ON public.classes FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Subjects
CREATE POLICY "Subjects access" ON public.subjects FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Class Teacher Assignments
CREATE POLICY "Assignments access" ON public.class_teacher_assignments FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Students
CREATE POLICY "Students access" ON public.students FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Parent Students
CREATE POLICY "Parent students access" ON public.parent_students FOR ALL USING (true) WITH CHECK (true);

-- Attendance
CREATE POLICY "Attendance access" ON public.attendance FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Student Results
CREATE POLICY "Student results access" ON public.student_results FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Terminal Reports
CREATE POLICY "Terminal reports access" ON public.terminal_reports FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Fee Structures
CREATE POLICY "Fee structures access" ON public.fee_structures FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Payments
CREATE POLICY "Payments access" ON public.payments FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Announcements
CREATE POLICY "Announcements access" ON public.announcements FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Teacher Reviews
CREATE POLICY "Reviews access" ON public.teacher_reviews FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Parent Feedback
CREATE POLICY "Feedback access" ON public.parent_feedback FOR ALL USING (school_id = public.current_user_school_id()) WITH CHECK (true);

-- Notifications
CREATE POLICY "Notifications access" ON public.notifications FOR ALL USING (user_id = auth.uid() OR school_id = public.current_user_school_id()) WITH CHECK (true);

-- User Invitations
CREATE POLICY "Invitations access" ON public.user_invitations FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 7. REALTIME & STORAGE
-- ==============================================================================

-- Create public storage bucket for school assets if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-assets', 'school-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Realtime publications on active tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parent_feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
