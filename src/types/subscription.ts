export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PENDING_VERIFICATION' | 'EXPIRED' | 'SUSPENDED' | 'REJECTED';
export type SubscriptionPaymentStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';

export interface SchoolSubscription {
  id: string;
  school_id: string;
  status: SubscriptionStatus;
  plan_name: string;
  amount: number;
  currency: string;
  trial_started_at: string | null;
  trial_expires_at: string | null;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  reminder_10d_sent: boolean;
  reminder_5d_sent: boolean;
  reminder_3d_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPayment {
  id: string;
  school_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  transaction_id: string;
  payment_date: string;
  screenshot_url: string | null;
  note: string | null;
  status: SubscriptionPaymentStatus;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  school?: { name: string; logo_url?: string | null };
  approver?: { full_name: string; email: string };
}

export interface SubscriptionAuditEntry {
  id: string;
  school_id: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  description: string | null;
  metadata: any;
  created_at: string;
}

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to compute days remaining
export function getDaysRemaining(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// Helper to format days remaining
export function formatDaysRemaining(expiresAt: string | null): string {
  const days = getDaysRemaining(expiresAt);
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
}

// Check if subscription is currently valid
export function isSubscriptionValid(sub: SchoolSubscription | null): boolean {
  if (!sub) return false;
  if (sub.status === 'ACTIVE') return true;
  if (sub.status === 'TRIAL') {
    if (sub.trial_expires_at) {
      return new Date(sub.trial_expires_at).getTime() > Date.now();
    }
    return true;
  }
  return false;
}
