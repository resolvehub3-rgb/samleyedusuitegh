-- =============================================================================
-- SAMLEYEDUSUITE SUBSCRIPTION SYSTEM MIGRATION
-- Run this in your Supabase SQL Editor to add subscription management
-- =============================================================================

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('TRIAL', 'ACTIVE', 'PENDING_VERIFICATION', 'EXPIRED', 'SUSPENDED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_payment_status AS ENUM ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. School Subscriptions Table
CREATE TABLE IF NOT EXISTS public.school_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  status subscription_status NOT NULL DEFAULT 'TRIAL',
  plan_name TEXT NOT NULL DEFAULT 'SamleyEduSuite School Plan',
  amount NUMERIC(10,2) NOT NULL DEFAULT 300.00,
  currency TEXT NOT NULL DEFAULT 'GHS',
  trial_started_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  reminder_10d_sent BOOLEAN DEFAULT FALSE,
  reminder_5d_sent BOOLEAN DEFAULT FALSE,
  reminder_3d_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_school_subscription UNIQUE (school_id)
);

-- 3. Subscription Payments Table
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.school_subscriptions(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 300.00,
  currency TEXT NOT NULL DEFAULT 'GHS',
  transaction_id TEXT NOT NULL,
  payment_date DATE NOT NULL,
  screenshot_url TEXT,
  note TEXT,
  status subscription_payment_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_transaction_id UNIQUE (school_id, transaction_id)
);

-- 4. Subscription Audit Log Table
CREATE TABLE IF NOT EXISTS public.subscription_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Platform Settings Table (for payment config)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Seed default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, description) VALUES
  ('payment_network', 'MTN Mobile Money', 'Mobile Money network for subscription payments'),
  ('payment_name', 'SamleyEduSuite', 'Payment account name'),
  ('payment_number', '', 'Mobile Money number for subscription payments'),
  ('payment_instructions', 'Send GH₵300 to the Mobile Money number above, then submit your transaction ID and payment screenshot from the School Admin Dashboard.', 'Payment instructions shown to school admins'),
  ('subscription_price', '300', 'Monthly subscription price in GHS'),
  ('subscription_currency', 'GHS', 'Subscription currency'),
  ('trial_days', '7', 'Number of trial days for new schools'),
  ('reminder_days', '10,5,3', 'Days before expiry to send reminders (comma-separated)')
ON CONFLICT (setting_key) DO NOTHING;

-- 7. Enable RLS
ALTER TABLE public.school_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies

-- School Subscriptions: School admins can read their own
DROP POLICY IF EXISTS "School subscription read own" ON public.school_subscriptions;
CREATE POLICY "School subscription read own" ON public.school_subscriptions
  FOR SELECT USING (
    school_id = public.current_user_school_id()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "School subscription insert" ON public.school_subscriptions;
CREATE POLICY "School subscription insert" ON public.school_subscriptions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "School subscription update" ON public.school_subscriptions;
CREATE POLICY "School subscription update" ON public.school_subscriptions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR school_id = public.current_user_school_id()
  );

-- Subscription Payments: School admins can read/insert their own, super admin can read/update all
DROP POLICY IF EXISTS "Subscription payments school read" ON public.subscription_payments;
CREATE POLICY "Subscription payments school read" ON public.subscription_payments
  FOR SELECT USING (
    school_id = public.current_user_school_id()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "Subscription payments school insert" ON public.subscription_payments;
CREATE POLICY "Subscription payments school insert" ON public.subscription_payments
  FOR INSERT WITH CHECK (
    school_id = public.current_user_school_id()
  );

DROP POLICY IF EXISTS "Subscription payments super admin update" ON public.subscription_payments;
CREATE POLICY "Subscription payments super admin update" ON public.subscription_payments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Subscription Audit Log: Super admin can read all, school admins can read their own
DROP POLICY IF EXISTS "Subscription audit read" ON public.subscription_audit_log;
CREATE POLICY "Subscription audit read" ON public.subscription_audit_log
  FOR SELECT USING (
    school_id = public.current_user_school_id()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "Subscription audit insert" ON public.subscription_audit_log;
CREATE POLICY "Subscription audit insert" ON public.subscription_audit_log
  FOR INSERT WITH CHECK (true);

-- Platform Settings: Authenticated users can read, super admin can update
DROP POLICY IF EXISTS "Platform settings read" ON public.platform_settings;
CREATE POLICY "Platform settings read" ON public.platform_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Platform settings update" ON public.platform_settings;
CREATE POLICY "Platform settings update" ON public.platform_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- 9. Storage bucket for payment screenshots (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: School admins and parents can upload to their school's folder
DROP POLICY IF EXISTS "Payment screenshots upload" ON storage.objects;
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

-- Storage policy: Users can read their school's screenshots, super admin can read all
DROP POLICY IF EXISTS "Payment screenshots read" ON storage.objects;
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

-- Storage policy: Users can delete their school's own screenshots
DROP POLICY IF EXISTS "Payment screenshots delete" ON storage.objects;
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

-- 10. Enable Realtime on new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_audit_log;

-- 11. Create subscription audit log helper function
CREATE OR REPLACE FUNCTION public.log_subscription_event(
  p_school_id UUID,
  p_actor_id UUID,
  p_actor_email TEXT,
  p_actor_role TEXT,
  p_action TEXT,
  p_entity TEXT,
  p_entity_id UUID,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.subscription_audit_log (
    school_id, actor_id, actor_email, actor_role, action, entity, entity_id, description, metadata
  ) VALUES (
    p_school_id, p_actor_id, p_actor_email, p_actor_role, p_action, p_entity, p_entity_id, p_description, p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create function to approve subscription payment (server-side logic)
CREATE OR REPLACE FUNCTION public.approve_subscription_payment(
  p_payment_id UUID,
  p_actor_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
  v_subscription RECORD;
  v_new_expiry TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  -- Only super_admin can approve
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND role = 'super_admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only Super Admin can approve payments');
  END IF;

  -- Get payment
  SELECT * INTO v_payment FROM public.subscription_payments WHERE id = p_payment_id AND status = 'PENDING_VERIFICATION';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found or already processed');
  END IF;

  -- Get current subscription
  SELECT * INTO v_subscription FROM public.school_subscriptions WHERE school_id = v_payment.school_id;

  -- Calculate new expiry
  -- Subscription always starts from the NEXT DAY after payment approval
  IF v_subscription IS NOT NULL AND v_subscription.subscription_expires_at IS NOT NULL
     AND v_subscription.subscription_expires_at > NOW() THEN
    -- Active: extend from current expiry
    v_new_expiry := v_subscription.subscription_expires_at + INTERVAL '1 month';
  ELSE
    -- Expired or no subscription: subscription starts from the next day after payment
    -- e.g., if approved on Sep 8, subscription runs Sep 9 – Oct 9
    v_new_expiry := DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '1 month';
  END IF;

  -- Update payment status
  UPDATE public.subscription_payments
  SET status = 'APPROVED', approved_by = p_actor_id, approved_at = NOW(), updated_at = NOW()
  WHERE id = p_payment_id;

  -- Update or create subscription
  IF v_subscription IS NOT NULL THEN
    UPDATE public.school_subscriptions
    SET status = 'ACTIVE',
        subscription_started_at = COALESCE(v_subscription.subscription_started_at, DATE_TRUNC('day', NOW()) + INTERVAL '1 day'),
        subscription_expires_at = v_new_expiry,
        reminder_10d_sent = FALSE,
        reminder_5d_sent = FALSE,
        reminder_3d_sent = FALSE,
        updated_at = NOW()
    WHERE school_id = v_payment.school_id;
  ELSE
    INSERT INTO public.school_subscriptions (school_id, status, subscription_started_at, subscription_expires_at)
    VALUES (v_payment.school_id, 'ACTIVE', DATE_TRUNC('day', NOW()) + INTERVAL '1 day', v_new_expiry);
  END IF;

  -- Log audit event (non-critical, don't let failure block approval)
  BEGIN
    PERFORM public.log_subscription_event(
      v_payment.school_id, p_actor_id, NULL, 'super_admin',
      'payment_approved', 'subscription_payment', p_payment_id,
      'Payment approved - Subscription extended to ' || v_new_expiry::date,
      jsonb_build_object('payment_id', p_payment_id, 'new_expiry', v_new_expiry)
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to log audit event: %', SQLERRM;
  END;

  -- Create notification for school admin (non-critical, don't let failure block approval)
  BEGIN
    INSERT INTO public.notifications (school_id, user_id, type, title, message, is_read)
    SELECT v_payment.school_id, p.id, 'payment',
      'Subscription Payment Approved',
      'Your subscription payment of ' || v_payment.amount || ' ' || v_payment.currency || ' has been approved. Your subscription is now active until ' || v_new_expiry::date || '.',
      FALSE
    FROM public.profiles p WHERE p.school_id = v_payment.school_id AND p.role = 'admin';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create notification: %', SQLERRM;
  END;

  RETURN jsonb_build_object('success', true, 'new_expiry', v_new_expiry::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create function to reject subscription payment
CREATE OR REPLACE FUNCTION public.reject_subscription_payment(
  p_payment_id UUID,
  p_actor_id UUID,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
BEGIN
  -- Only super_admin can reject
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND role = 'super_admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only Super Admin can reject payments');
  END IF;

  SELECT * INTO v_payment FROM public.subscription_payments WHERE id = p_payment_id AND status = 'PENDING_VERIFICATION';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found or already processed');
  END IF;

  -- Update payment
  UPDATE public.subscription_payments
  SET status = 'REJECTED', rejection_reason = p_reason, approved_by = p_actor_id, approved_at = NOW(), updated_at = NOW()
  WHERE id = p_payment_id;

  -- Log audit event (non-critical, don't let failure block rejection)
  BEGIN
    PERFORM public.log_subscription_event(
      v_payment.school_id, p_actor_id, NULL, 'super_admin',
      'payment_rejected', 'subscription_payment', p_payment_id,
      'Payment rejected: ' || p_reason,
      jsonb_build_object('payment_id', p_payment_id, 'reason', p_reason)
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to log audit event: %', SQLERRM;
  END;

  -- Notify school admin (non-critical, don't let failure block rejection)
  BEGIN
    INSERT INTO public.notifications (school_id, user_id, type, title, message, is_read)
    SELECT v_payment.school_id, p.id, 'payment',
      'Subscription Payment Rejected',
      'Your subscription payment (Transaction: ' || v_payment.transaction_id || ') has been rejected. Reason: ' || p_reason || '. Please submit a new payment.',
      FALSE
    FROM public.profiles p WHERE p.school_id = v_payment.school_id AND p.role = 'admin';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create notification: %', SQLERRM;
  END;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create function to check and suspend expired subscriptions
CREATE OR REPLACE FUNCTION public.check_expired_subscriptions()
RETURNS VOID AS $$
BEGIN
  -- Suspend schools whose trial or subscription has expired
  UPDATE public.school_subscriptions
  SET status = 'SUSPENDED', updated_at = NOW()
  WHERE status IN ('TRIAL', 'ACTIVE')
    AND (
      (trial_expires_at IS NOT NULL AND trial_expires_at < NOW())
      OR (subscription_expires_at IS NOT NULL AND subscription_expires_at < NOW())
    );

  -- Log suspension events for newly suspended schools
  INSERT INTO public.subscription_audit_log (school_id, action, entity, description, created_at)
  SELECT ss.school_id, 'subscription_expired', 'school_subscription',
    'Subscription expired automatically', NOW()
  FROM public.school_subscriptions ss
  WHERE ss.status = 'SUSPENDED'
    AND ss.updated_at >= NOW() - INTERVAL '1 minute'
    AND NOT EXISTS (
      SELECT 1 FROM public.subscription_audit_log sal
      WHERE sal.school_id = ss.school_id AND sal.action = 'subscription_expired'
        AND sal.created_at >= NOW() - INTERVAL '1 minute'
    );

  -- Send notifications to suspended schools
  INSERT INTO public.notifications (school_id, user_id, type, title, message, is_read)
  SELECT ss.school_id, p.id, 'payment',
    'Subscription Expired',
    'Your SamleyEduSuite subscription has expired. Please submit a payment renewal to restore access.',
    FALSE
  FROM public.school_subscriptions ss
  JOIN public.profiles p ON p.school_id = ss.school_id AND p.role = 'admin'
  WHERE ss.status = 'SUSPENDED'
    AND ss.updated_at >= NOW() - INTERVAL '1 minute'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.school_id = ss.school_id AND n.title = 'Subscription Expired'
        AND n.created_at >= NOW() - INTERVAL '1 hour'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create function to send subscription reminders
CREATE OR REPLACE FUNCTION public.send_subscription_reminders()
RETURNS VOID AS $$
DECLARE
  v_reminder_days TEXT[];
  v_days TEXT;
BEGIN
  -- Get reminder days from platform settings
  SELECT string_to_array(setting_value, ',') INTO v_reminder_days
  FROM public.platform_settings WHERE setting_key = 'reminder_days';

  IF v_reminder_days IS NULL THEN
    v_reminder_days := ARRAY['10', '5', '3'];
  END IF;

  FOREACH v_days IN ARRAY v_reminder_days LOOP
    -- Send 10-day reminders
    IF v_days = '10' THEN
      INSERT INTO public.notifications (school_id, user_id, type, title, message, is_read)
      SELECT ss.school_id, p.id, 'payment',
        'Subscription Renewal Reminder (10 Days)',
        'Your SamleyEduSuite subscription expires in 10 days (on ' || COALESCE(ss.subscription_expires_at, ss.trial_expires_at)::date || '). Please submit your GH₵300 payment to avoid service interruption.',
        FALSE
      FROM public.school_subscriptions ss
      JOIN public.profiles p ON p.school_id = ss.school_id AND p.role = 'admin'
      WHERE ss.status IN ('TRIAL', 'ACTIVE')
        AND NOT ss.reminder_10d_sent
        AND (
          (ss.subscription_expires_at IS NOT NULL AND ss.subscription_expires_at::date = CURRENT_DATE + INTERVAL '10 days')
          OR (ss.trial_expires_at IS NOT NULL AND ss.trial_expires_at::date = CURRENT_DATE + INTERVAL '10 days')
        );

      UPDATE public.school_subscriptions SET reminder_10d_sent = TRUE
      WHERE status IN ('TRIAL', 'ACTIVE')
        AND NOT reminder_10d_sent
        AND (
          (subscription_expires_at IS NOT NULL AND subscription_expires_at::date = CURRENT_DATE + INTERVAL '10 days')
          OR (trial_expires_at IS NOT NULL AND trial_expires_at::date = CURRENT_DATE + INTERVAL '10 days')
        );
    END IF;

    -- Send 5-day reminders
    IF v_days = '5' THEN
      INSERT INTO public.notifications (school_id, user_id, type, title, message, is_read)
      SELECT ss.school_id, p.id, 'payment',
        'Subscription Expiring Soon (5 Days)',
        'Your SamleyEduSuite subscription expires in 5 days (on ' || COALESCE(ss.subscription_expires_at, ss.trial_expires_at)::date || '). Please submit your GH₵300 payment immediately.',
        FALSE
      FROM public.school_subscriptions ss
      JOIN public.profiles p ON p.school_id = ss.school_id AND p.role = 'admin'
      WHERE ss.status IN ('TRIAL', 'ACTIVE')
        AND NOT ss.reminder_5d_sent
        AND (
          (ss.subscription_expires_at IS NOT NULL AND ss.subscription_expires_at::date = CURRENT_DATE + INTERVAL '5 days')
          OR (ss.trial_expires_at IS NOT NULL AND ss.trial_expires_at::date = CURRENT_DATE + INTERVAL '5 days')
        );

      UPDATE public.school_subscriptions SET reminder_5d_sent = TRUE
      WHERE status IN ('TRIAL', 'ACTIVE')
        AND NOT reminder_5d_sent
        AND (
          (subscription_expires_at IS NOT NULL AND subscription_expires_at::date = CURRENT_DATE + INTERVAL '5 days')
          OR (trial_expires_at IS NOT NULL AND trial_expires_at::date = CURRENT_DATE + INTERVAL '5 days')
        );
    END IF;

    -- Send 3-day reminders
    IF v_days = '3' THEN
      INSERT INTO public.notifications (school_id, user_id, type, title, message, is_read)
      SELECT ss.school_id, p.id, 'payment',
        'Subscription Urgent (3 Days Left)',
        'Your SamleyEduSuite subscription expires in 3 days (on ' || COALESCE(ss.subscription_expires_at, ss.trial_expires_at)::date || '). Your access will be suspended if payment is not submitted.',
        FALSE
      FROM public.school_subscriptions ss
      JOIN public.profiles p ON p.school_id = ss.school_id AND p.role = 'admin'
      WHERE ss.status IN ('TRIAL', 'ACTIVE')
        AND NOT ss.reminder_3d_sent
        AND (
          (ss.subscription_expires_at IS NOT NULL AND ss.subscription_expires_at::date = CURRENT_DATE + INTERVAL '3 days')
          OR (ss.trial_expires_at IS NOT NULL AND ss.trial_expires_at::date = CURRENT_DATE + INTERVAL '3 days')
        );

      UPDATE public.school_subscriptions SET reminder_3d_sent = TRUE
      WHERE status IN ('TRIAL', 'ACTIVE')
        AND NOT reminder_3d_sent
        AND (
          (subscription_expires_at IS NOT NULL AND subscription_expires_at::date = CURRENT_DATE + INTERVAL '3 days')
          OR (trial_expires_at IS NOT NULL AND trial_expires_at::date = CURRENT_DATE + INTERVAL '3 days')
        );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Add status column to schools if not exists
DO $$ BEGIN
  ALTER TABLE public.schools ADD COLUMN status TEXT DEFAULT 'active';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
