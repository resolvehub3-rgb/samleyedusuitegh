#!/usr/bin/env node
// Push Super Admin migration to Supabase via direct PostgreSQL connection
// Usage: node scripts/push-super-admin-migration.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://oswxgbvfgwrqlhbmntdi.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zd3hnYnZmZ3dycWxoYm1udGRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODQ0MDQ4OCwiZXhwIjoyMTA0MDE2NDg4fQ.5QM_chf4ErHv9a7J6pROyyYW3cCXByReJLBKRcoDdv0';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// SQL split into two parts to avoid the enum commit issue
const SQL_PART1 = `
-- PART 1: Tables, enum, indexes

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'pending', 'deactivated'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS slug TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

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

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;
`;

const SQL_PART2 = `
-- PART 2: Security functions and RLS policies

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_actor_id UUID DEFAULT NULL, p_actor_email TEXT DEFAULT NULL,
  p_actor_role TEXT DEFAULT NULL, p_school_id UUID DEFAULT NULL,
  p_school_name TEXT DEFAULT NULL, p_action TEXT DEFAULT NULL,
  p_entity TEXT DEFAULT NULL, p_entity_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL, p_metadata JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE new_id UUID;
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

CREATE POLICY "Super admin read platform_settings" ON public.platform_settings FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin update platform_settings" ON public.platform_settings FOR UPDATE USING (public.is_super_admin());
CREATE POLICY "Super admin insert platform_settings" ON public.platform_settings FOR INSERT WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admin read audit_logs" ON public.audit_logs FOR SELECT USING (public.is_super_admin());
CREATE POLICY "System insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read published platform_announcements" ON public.platform_announcements FOR SELECT USING (is_published = true OR public.is_super_admin());
CREATE POLICY "Super admin insert platform_announcements" ON public.platform_announcements FOR INSERT WITH CHECK (public.is_super_admin());
CREATE POLICY "Super admin update platform_announcements" ON public.platform_announcements FOR UPDATE USING (public.is_super_admin());
CREATE POLICY "Super admin delete platform_announcements" ON public.platform_announcements FOR DELETE USING (public.is_super_admin());

CREATE POLICY "Users read own platform_notifications" ON public.platform_notifications FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "System insert platform_notifications" ON public.platform_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own platform_notifications" ON public.platform_notifications FOR UPDATE USING (user_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Super admin delete platform_notifications" ON public.platform_notifications FOR DELETE USING (public.is_super_admin());

CREATE POLICY "Super admin read all schools" ON public.schools FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin update schools" ON public.schools FOR UPDATE USING (public.is_super_admin());
CREATE POLICY "Super admin read all profiles" ON public.profiles FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin update profiles" ON public.profiles FOR UPDATE USING (public.is_super_admin());
CREATE POLICY "Super admin read all classes" ON public.classes FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all subjects" ON public.subjects FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all students" ON public.students FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all attendance" ON public.attendance FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all payments" ON public.payments FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all announcements" ON public.announcements FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin insert announcements" ON public.announcements FOR INSERT WITH CHECK (public.is_super_admin());
CREATE POLICY "Super admin read all notifications" ON public.notifications FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all parent_students" ON public.parent_students FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all fee_structures" ON public.fee_structures FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all school_settings" ON public.school_settings FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all assignments" ON public.class_teacher_assignments FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all results" ON public.student_results FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all terminal_reports" ON public.terminal_reports FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all reviews" ON public.teacher_reviews FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all feedback" ON public.parent_feedback FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Super admin read all invitations" ON public.user_invitations FOR SELECT USING (public.is_super_admin());
`;

async function executeSQL(sql, label) {
  console.log(`\n▶ Running ${label}...`);
  
  // Split by semicolons but be smart about it (don't split inside $$ blocks)
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  
  for (let i = 0; i < sql.length; i++) {
    current += sql[i];
    if (sql[i] === '$' && sql[i+1] === '$') {
      inDollarQuote = !inDollarQuote;
      current += '$';
      i++;
    }
    if (sql[i] === ';' && !inDollarQuote) {
      const trimmed = current.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      current = '';
    }
  }
  
  let success = 0;
  let errors = 0;
  
  for (const stmt of statements) {
    // Skip pure comments
    if (stmt.startsWith('--')) continue;
    
    try {
      const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' }).single();
      if (error) {
        // Try direct query via postgrest
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ query: stmt + ';' })
        });
        
        if (!res.ok) {
          const errText = await res.text();
          // Many errors are non-fatal (table already exists, policy exists, etc.)
          if (errText.includes('already exists') || errText.includes('duplicate_object') || errText.includes('already enabled')) {
            success++;
          } else {
            console.log(`  ⚠️  ${errText.slice(0, 120)}`);
            errors++;
          }
        } else {
          success++;
        }
      } else {
        success++;
      }
    } catch (e) {
      if (e.message?.includes('already exists')) {
        success++;
      } else {
        console.log(`  ⚠️  ${e.message?.slice(0, 120)}`);
        errors++;
      }
    }
  }
  
  console.log(`  ✅ ${label}: ${success} succeeded, ${errors} had issues`);
  return errors === 0;
}

async function createAuthUser() {
  console.log('\n▶ Creating Super Admin auth user...');
  
  try {
    // Create user via Supabase Auth admin API
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        email: 'admin@samleyedusuite.com',
        password: 'SuperAdmin@2025!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Platform Administrator',
          role: 'super_admin'
        }
      })
    });
    
    const data = await res.json();
    
    if (data.id) {
      console.log(`  ✅ Auth user created: ${data.id}`);
      return data.id;
    } else if (data.msg?.includes('already') || data.code === 'email_exists') {
      // User already exists, fetch it
      console.log('  ℹ️  User already exists, fetching ID...');
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      });
      const users = await listRes.json();
      const existing = users?.users?.find(u => u.email === 'admin@samleyedusuite.com');
      if (existing) {
        console.log(`  ✅ Found existing user: ${existing.id}`);
        return existing.id;
      }
      console.log('  ❌ Could not find existing user');
      return null;
    } else {
      console.log('  ❌ Error:', JSON.stringify(data));
      return null;
    }
  } catch (e) {
    console.log('  ❌ Error:', e.message);
    return null;
  }
}

async function createProfile(userId) {
  console.log('\n▶ Creating Super Admin profile...');
  
  // Get first school
  const { data: schools } = await supabase.from('schools').select('id').limit(1);
  const schoolId = schools?.[0]?.id;
  
  if (!schoolId) {
    console.log('  ❌ No schools found in database. Create a school first, then run the profile insert.');
    console.log('  Run this SQL manually after creating a school:');
    console.log(`  INSERT INTO public.profiles (id, school_id, full_name, email, phone, role, gender, is_active) VALUES ('${userId}', '<SCHOOL_ID>', 'Platform Administrator', 'admin@samleyedusuite.com', '+233000000000', 'super_admin', 'Male', true);`);
    return false;
  }
  
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      school_id: schoolId,
      full_name: 'Platform Administrator',
      email: 'admin@samleyedusuite.com',
      phone: '+233000000000',
      role: 'super_admin',
      gender: 'Male',
      is_active: true,
    }, { onConflict: 'id' });
  
  if (error) {
    // Try via RPC if direct upsert fails (RLS might block)
    console.log('  ⚠️  Direct upsert failed, trying via admin_create_profile RPC...');
    const { error: rpcError } = await supabase.rpc('admin_create_profile', {
      p_id: userId,
      p_school_id: schoolId,
      p_full_name: 'Platform Administrator',
      p_email: 'admin@samleyedusuite.com',
      p_phone: '+233000000000',
      p_role: 'super_admin',
      p_gender: 'Male',
      p_is_active: true,
    });
    
    if (rpcError) {
      console.log('  ❌ Profile creation failed:', rpcError.message);
      return false;
    }
    console.log('  ✅ Super Admin profile created via RPC');
    return true;
  }
  
  console.log('  ✅ Super Admin profile created');
  return true;
}

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  SamleyEduSuite - Super Admin Migration  ║');
  console.log('╚══════════════════════════════════════════╝');
  
  try {
    // Test connection
    const { error: testErr } = await supabase.from('schools').select('id').limit(1);
    if (testErr && testErr.code !== 'PGRST116') {
      console.log('❌ Cannot connect to Supabase:', testErr.message);
      process.exit(1);
    }
    console.log('✅ Connected to Supabase');
    
    // Part 1: Tables & Enum
    await executeSQL(SQL_PART1, 'Part 1 - Tables & Enum');
    
    // Small delay for transaction commit
    await new Promise(r => setTimeout(r, 1000));
    
    // Part 2: Functions & RLS
    await executeSQL(SQL_PART2, 'Part 2 - Functions & RLS');
    
    // Create auth user
    const userId = await createAuthUser();
    
    if (userId) {
      // Create profile
      await createProfile(userId);
    }
    
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║           Migration Complete!            ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('\nLogin credentials:');
    console.log('  Email:    admin@samleyedusuite.com');
    console.log('  Password: SuperAdmin@2025!');
    console.log('\n⚠️  Change this password after first login!');
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

main();
