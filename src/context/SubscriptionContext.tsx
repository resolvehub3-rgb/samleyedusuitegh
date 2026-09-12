import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getSupabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  SchoolSubscription,
  SubscriptionPayment,
  SubscriptionAuditEntry,
  PlatformSetting,
  SubscriptionStatus,
  getDaysRemaining,
} from '../types/subscription';

interface SubscriptionContextType {
  subscription: SchoolSubscription | null;
  payments: SubscriptionPayment[];
  paymentHistory: SubscriptionPayment[];
  platformSettings: PlatformSetting[];
  loading: boolean;
  daysRemaining: number;
  isExpired: boolean;
  isSuspended: boolean;
  isActive: boolean;
  isTrial: boolean;
  fetchSubscription: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  submitPayment: (data: {
    amount: number;
    transaction_id: string;
    payment_date: string;
    screenshot_url: string;
    note?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  getPaymentConfig: () => { network: string; name: string; number: string; instructions: string; price: string };
  // Super Admin
  allSubscriptions: SchoolSubscription[];
  allPayments: SubscriptionPayment[];
  fetchAllSubscriptions: () => Promise<void>;
  fetchAllPayments: () => Promise<void>;
  approvePayment: (paymentId: string) => Promise<{ success: boolean; error?: string }>;
  rejectPayment: (paymentId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  subscriptionStats: {
    totalSchools: number;
    trial: number;
    active: number;
    pendingVerification: number;
    expired: number;
    suspended: number;
    paymentsPending: number;
    paymentsApproved: number;
    paymentsRejected: number;
  };
  fetchSubscriptionStats: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, school } = useAuth();
  const supabase = getSupabase();

  const [subscription, setSubscription] = useState<SchoolSubscription | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<SubscriptionPayment[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);

  // Super Admin
  const [allSubscriptions, setAllSubscriptions] = useState<SchoolSubscription[]>([]);
  const [allPayments, setAllPayments] = useState<SubscriptionPayment[]>([]);
  const [subscriptionStats, setSubscriptionStats] = useState({
    totalSchools: 0, trial: 0, active: 0, pendingVerification: 0,
    expired: 0, suspended: 0, paymentsPending: 0, paymentsApproved: 0, paymentsRejected: 0,
  });

  const mountedRef = useRef(true);

  // Computed
  const daysRemaining = getDaysRemaining(
    subscription?.status === 'TRIAL' ? subscription.trial_expires_at : subscription?.subscription_expires_at
  );
  const isExpired = subscription?.status === 'EXPIRED' || subscription?.status === 'SUSPENDED';
  const isSuspended = subscription?.status === 'SUSPENDED';
  const isActive = subscription?.status === 'ACTIVE';
  const isTrial = subscription?.status === 'TRIAL';

  // Fetch school subscription
  const fetchSubscription = useCallback(async () => {
    if (!school) return;
    try {
      const { data, error } = await supabase
        .from('school_subscriptions')
        .select('*')
        .eq('school_id', school.id)
        .maybeSingle();

      if (!error && data) {
        setSubscription(data as SchoolSubscription);
      } else if (!data) {
        // No subscription record yet — create trial
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const { data: newSub } = await supabase
          .from('school_subscriptions')
          .insert({
            school_id: school.id,
            status: 'TRIAL',
            trial_started_at: now.toISOString(),
            trial_expires_at: trialEnd.toISOString(),
          })
          .select()
          .maybeSingle();

        if (newSub) setSubscription(newSub as SchoolSubscription);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  }, [school, supabase]);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    if (!school) return;
    try {
      const { data, error } = await supabase
        .from('subscription_payments')
        .select('*, school:schools(name, logo_url)')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPayments(data as SubscriptionPayment[]);
        setPaymentHistory(data as SubscriptionPayment[]);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  }, [school, supabase]);

  // Submit payment
  const submitPayment = async (data: {
    amount: number;
    transaction_id: string;
    payment_date: string;
    screenshot_url: string;
    note?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!school) return { success: false, error: 'No school context' };

    try {
      const { error } = await supabase.from('subscription_payments').insert({
        school_id: school.id,
        subscription_id: subscription?.id || null,
        amount: data.amount,
        currency: 'GHS',
        transaction_id: data.transaction_id,
        payment_date: data.payment_date,
        screenshot_url: data.screenshot_url,
        note: data.note || null,
        status: 'PENDING_VERIFICATION',
      });

      if (error) {
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          return { success: false, error: 'This transaction ID has already been submitted.' };
        }
        return { success: false, error: error.message };
      }

      // Log audit
      await supabase.rpc('log_subscription_event', {
        p_school_id: school.id,
        p_actor_id: user?.id || null,
        p_actor_email: user?.email || null,
        p_actor_role: 'admin',
        p_action: 'payment_submitted',
        p_entity: 'subscription_payment',
        p_entity_id: null,
        p_description: `Payment submitted: ${data.amount} GHS, Transaction: ${data.transaction_id}`,
        p_metadata: JSON.stringify({ amount: data.amount, transaction_id: data.transaction_id }),
      });

      // Notify super admins
      const { data: superAdmins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'super_admin');

      if (superAdmins && superAdmins.length > 0) {
        for (const sa of superAdmins) {
          await supabase.from('notifications').insert({
            school_id: school.id,
            user_id: sa.id,
            type: 'payment',
            title: 'New Subscription Payment',
            message: `${school.name} has submitted a subscription payment of GH₵${data.amount}. Transaction: ${data.transaction_id}.`,
            is_read: false,
          });
        }
      }

      await fetchPayments();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit payment' };
    }
  };

  // Get payment config from platform settings
  const getPaymentConfig = () => {
    const get = (key: string) => platformSettings.find(s => s.setting_key === key)?.setting_value || '';
    return {
      network: get('payment_network') || 'MTN Mobile Money',
      name: get('payment_name') || 'SamleyEduSuite',
      number: get('payment_number'),
      instructions: get('payment_instructions') || 'Make your payment using the Mobile Money details below.',
      price: get('subscription_price') || '300',
    };
  };

  // Fetch platform settings
  const fetchPlatformSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('setting_key');

      if (!error && data) {
        setPlatformSettings(data as PlatformSetting[]);
      }
    } catch (err) {
      console.error('Error fetching platform settings:', err);
    }
  }, [supabase]);

  // ========== SUPER ADMIN FUNCTIONS ==========

  const fetchAllSubscriptions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('school_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAllSubscriptions(data as SchoolSubscription[]);
      }
    } catch (err) {
      console.error('Error fetching all subscriptions:', err);
    }
  }, [supabase]);

  const fetchAllPayments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_payments')
        .select('*, school:schools(name, logo_url), approver:profiles!approved_by(full_name, email)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAllPayments(data as SubscriptionPayment[]);
      }
    } catch (err) {
      console.error('Error fetching all payments:', err);
    }
  }, [supabase]);

  const approvePayment = async (paymentId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc('approve_subscription_payment', {
        p_payment_id: paymentId,
        p_actor_id: user?.id,
      });

      if (error) return { success: false, error: error.message };
      const result = data as any;
      if (!result?.success) return { success: false, error: result?.error || 'Approval failed' };

      await fetchAllPayments();
      await fetchAllSubscriptions();
      await fetchSubscriptionStats();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const rejectPayment = async (paymentId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc('reject_subscription_payment', {
        p_payment_id: paymentId,
        p_actor_id: user?.id,
        p_reason: reason,
      });

      if (error) return { success: false, error: error.message };
      const result = data as any;
      if (!result?.success) return { success: false, error: result?.error || 'Rejection failed' };

      await fetchAllPayments();
      await fetchSubscriptionStats();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const fetchSubscriptionStats = useCallback(async () => {
    try {
      const [schoolRes, subRes, paymentRes] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact', head: true }),
        supabase.from('school_subscriptions').select('status'),
        supabase.from('subscription_payments').select('status'),
      ]);

      const totalSchools = schoolRes.count || 0;
      const subs = (subRes.data || []) as { status: string }[];
      const pays = (paymentRes.data || []) as { status: string }[];

      setSubscriptionStats({
        totalSchools,
        trial: subs.filter(s => s.status === 'TRIAL').length,
        active: subs.filter(s => s.status === 'ACTIVE').length,
        pendingVerification: subs.filter(s => s.status === 'PENDING_VERIFICATION').length,
        expired: subs.filter(s => s.status === 'EXPIRED').length,
        suspended: subs.filter(s => s.status === 'SUSPENDED').length,
        paymentsPending: pays.filter(p => p.status === 'PENDING_VERIFICATION').length,
        paymentsApproved: pays.filter(p => p.status === 'APPROVED').length,
        paymentsRejected: pays.filter(p => p.status === 'REJECTED').length,
      });
    } catch (err) {
      console.error('Error fetching subscription stats:', err);
    }
  }, [supabase]);

  // ========== EFFECTS ==========

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Expiry reminder: send notification when subscription is within 3 days of expiry
  useEffect(() => {
    if (!subscription || !school || !user) return;
    if (subscription.status === 'SUSPENDED' || subscription.status === 'EXPIRED') return;

    const expiresAt = subscription.status === 'TRIAL'
      ? subscription.trial_expires_at
      : subscription.subscription_expires_at;
    if (!expiresAt) return;

    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Determine which reminder to send
    const reminderDays = [3, 5, 10];
    const reminderFlags: Record<number, boolean> = {
      3: subscription.reminder_3d_sent,
      5: subscription.reminder_5d_sent,
      10: subscription.reminder_10d_sent,
    };

    for (const days of reminderDays) {
      if (daysLeft <= days && daysLeft > 0 && !reminderFlags[days]) {
        // Send notification to school admin
        const title = days <= 3
          ? `⚠️ Subscription Expiring in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''}`
          : `🔔 Subscription Renewal Reminder (${daysLeft} Days)`;
        const message = daysLeft <= 3
          ? `Your SamleyEduSuite subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (on ${expiry.toLocaleDateString()}). Please submit your GH${subscription.amount || '300'} payment to avoid service interruption.`
          : `Your SamleyEduSuite subscription expires in ${daysLeft} days (on ${expiry.toLocaleDateString()}). Please submit your GH${subscription.amount || '300'} payment.`;

        // Insert notification
        supabase.from('notifications').insert({
          school_id: school.id,
          user_id: user.id,
          type: 'payment',
          title,
          message,
          is_read: false,
        }).then(() => {
          // Mark reminder as sent
          const updateField = days === 3 ? 'reminder_3d_sent' : days === 5 ? 'reminder_5d_sent' : 'reminder_10d_sent';
          supabase.from('school_subscriptions')
            .update({ [updateField]: true })
            .eq('id', subscription.id)
            .then(() => {
              // Update local state
              setSubscription(prev => prev ? { ...prev, [updateField]: true } : prev);
            });
        });

        break; // Only send one reminder per render
      }
    }
  }, [subscription, school, user, supabase]);

  // School-level data
  useEffect(() => {
    if (!school) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      await Promise.all([fetchSubscription(), fetchPayments(), fetchPlatformSettings()]);
      if (mountedRef.current) setLoading(false);
    }
    load();
  }, [school, fetchSubscription, fetchPayments, fetchPlatformSettings]);

  // Realtime subscription for school payments
  useEffect(() => {
    if (!school) return;

    const channel = supabase
      .channel(`subscription:${school.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscription_payments', filter: `school_id=eq.${school.id}` }, () => {
        fetchPayments();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'school_subscriptions', filter: `school_id=eq.${school.id}` }, () => {
        fetchSubscription();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [school, supabase, fetchPayments, fetchSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription, payments, paymentHistory, platformSettings, loading,
        daysRemaining, isExpired, isSuspended, isActive, isTrial,
        fetchSubscription, fetchPayments, submitPayment, getPaymentConfig,
        allSubscriptions, allPayments,
        fetchAllSubscriptions, fetchAllPayments,
        approvePayment, rejectPayment,
        subscriptionStats, fetchSubscriptionStats,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
