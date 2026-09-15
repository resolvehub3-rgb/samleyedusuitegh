-- Run this SQL in Supabase SQL Editor to fix approve/reject functions
-- This replaces the previous version with an UPSERT to avoid unique constraint errors

-- 1. Drop and recreate approve function
DROP FUNCTION IF EXISTS public.approve_subscription_payment(UUID, UUID);

CREATE OR REPLACE FUNCTION public.approve_subscription_payment(
  p_payment_id UUID,
  p_actor_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
  v_new_expiry TIMESTAMPTZ;
  v_existing RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND role = 'super_admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only Super Admin can approve payments');
  END IF;

  SELECT * INTO v_payment FROM public.subscription_payments WHERE id = p_payment_id AND status = 'PENDING_VERIFICATION';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found or already processed');
  END IF;

  -- Check for existing subscription
  SELECT * INTO v_existing FROM public.school_subscriptions WHERE school_id = v_payment.school_id;

  IF v_existing IS NOT NULL AND v_existing.subscription_expires_at IS NOT NULL
     AND v_existing.subscription_expires_at > NOW() THEN
    v_new_expiry := v_existing.subscription_expires_at + INTERVAL '1 month';
  ELSE
    v_new_expiry := DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '1 month';
  END IF;

  -- Update payment status
  UPDATE public.subscription_payments
  SET status = 'APPROVED', approved_by = p_actor_id, approved_at = NOW(), updated_at = NOW()
  WHERE id = p_payment_id;

  -- Upsert subscription (avoids unique constraint errors)
  INSERT INTO public.school_subscriptions (school_id, status, subscription_started_at, subscription_expires_at, reminder_10d_sent, reminder_5d_sent, reminder_3d_sent, updated_at)
  VALUES (v_payment.school_id, 'ACTIVE', DATE_TRUNC('day', NOW()) + INTERVAL '1 day', v_new_expiry, FALSE, FALSE, FALSE, NOW())
  ON CONFLICT (school_id) DO UPDATE SET
    status = 'ACTIVE',
    subscription_started_at = COALESCE(public.school_subscriptions.subscription_started_at, DATE_TRUNC('day', NOW()) + INTERVAL '1 day'),
    subscription_expires_at = v_new_expiry,
    reminder_10d_sent = FALSE,
    reminder_5d_sent = FALSE,
    reminder_3d_sent = FALSE,
    updated_at = NOW();

  -- Log audit event (non-critical)
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

  -- Create notification for school admin (non-critical)
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

-- 2. Drop and recreate reject function
DROP FUNCTION IF EXISTS public.reject_subscription_payment(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.reject_subscription_payment(
  p_payment_id UUID,
  p_actor_id UUID,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND role = 'super_admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only Super Admin can reject payments');
  END IF;

  SELECT * INTO v_payment FROM public.subscription_payments WHERE id = p_payment_id AND status = 'PENDING_VERIFICATION';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found or already processed');
  END IF;

  UPDATE public.subscription_payments
  SET status = 'REJECTED', rejection_reason = p_reason, approved_by = p_actor_id, approved_at = NOW(), updated_at = NOW()
  WHERE id = p_payment_id;

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
