import React, { useState, useRef } from 'react';
import {
  CreditCard, Clock, CheckCircle2, AlertTriangle, Upload,
  Copy, Check, Shield, XCircle
} from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import { getSupabase } from '../../lib/supabase';
import { Modal } from '../common/Modal';
import { CountdownTimer } from './CountdownTimer';

export const SchoolSubscriptionDashboard: React.FC = () => {
  const { subscription, payments, submitPayment, getPaymentConfig, daysRemaining, isExpired, isSuspended, isActive, isTrial, loading } = useSubscription();
  const { school } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('300');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabase();
  const config = getPaymentConfig();

  const latestPayment = payments[0];
  const pendingPayment = payments.find(p => p.status === 'PENDING_VERIFICATION');

  const expiryDate = subscription?.status === 'TRIAL'
    ? subscription.trial_expires_at
    : subscription?.subscription_expires_at;

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Screenshot must be less than 5MB');
      return;
    }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setSubmitError('Screenshot must be JPG, PNG, or WEBP');
      return;
    }
    setScreenshotFile(file);
    setSubmitError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile || !school) return null;
    const fileExt = screenshotFile.name.split('.').pop() || 'jpg';
    const filePath = `payment-screenshots/${school.id}/${Date.now()}.${fileExt}`;

    // Auto-create bucket if missing (calls SECURITY DEFINER function)
    await supabase.rpc('ensure_payment_screenshots_bucket');

    const { error } = await supabase.storage.from('payment-screenshots').upload(filePath, screenshotFile, { upsert: false });
    if (error) return null;
    const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!transactionId.trim()) { setSubmitError('Transaction ID is required'); return; }
    if (!screenshotFile) { setSubmitError('Payment screenshot is required'); return; }
    if (Number(paymentAmount) < 1) { setSubmitError('Invalid amount'); return; }

    setSubmitting(true);
    setUploading(true);
    try {
      const screenshotUrl = await uploadScreenshot();
      if (!screenshotUrl) { setSubmitError('Failed to upload screenshot'); setSubmitting(false); setUploading(false); return; }
      setUploading(false);

      const result = await submitPayment({
        amount: Number(paymentAmount),
        transaction_id: transactionId.trim(),
        payment_date: paymentDate,
        screenshot_url: screenshotUrl,
        note: paymentNote || undefined,
      });

      if (result.success) {
        setSubmitSuccess(true);
        setTransactionId(''); setPaymentNote('');
        setScreenshotFile(null); setScreenshotPreview('');
        setTimeout(() => { setShowPaymentForm(false); setSubmitSuccess(false); }, 3000);
      } else {
        setSubmitError(result.error || 'Submission failed');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Unexpected error');
    } finally {
      setSubmitting(false); setUploading(false);
    }
  };

  const handleCopyNumber = async () => {
    try { await navigator.clipboard.writeText(config.number); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'REJECTED': return 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Subscription Status Card */}
      <div className={`px-3 py-2 rounded-xl border shadow-xs ${
        isSuspended ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
        : isTrial ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
        : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className={`w-3 h-3 ${
              isSuspended ? 'text-rose-600' : isTrial ? 'text-amber-600' : 'text-emerald-600'
            }`} />
            <span className="text-[11px] font-bold text-slate-900 dark:text-white">
              SamleyEduSuite School Plan
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">GH₵{config.price}/mo</span>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
              isSuspended ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' :
              isTrial ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
            }`}>
              {isSuspended && <AlertTriangle className="w-2.5 h-2.5" />}
              {isTrial && <Clock className="w-2.5 h-2.5" />}
              {isActive && <CheckCircle2 className="w-2.5 h-2.5" />}
              {subscription?.status || 'Unknown'}
            </span>
          </div>
          {!pendingPayment && (isSuspended || isTrial || (isActive && daysRemaining <= 7)) && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition-all shadow-sm shadow-orange-600/20 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {isSuspended ? 'Renew Now' : 'Make Payment'}
            </button>
          )}
          {!pendingPayment && isActive && daysRemaining > 7 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3" />
              Active — next pay in {daysRemaining}d
            </span>
          )}
        </div>

        {/* Live Countdown Timer */}
        <div className="mt-1.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
          <CountdownTimer
            expiresAt={expiryDate}
            isTrial={isTrial}
            isActive={isActive}
            isSuspended={isSuspended}
          />
          {isTrial && (
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
              Started {subscription?.trial_started_at ? new Date(subscription.trial_started_at).toLocaleDateString() : 'N/A'}
            </p>
          )}
          {isActive && subscription?.subscription_started_at && (
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
              Renewed {new Date(subscription.subscription_started_at).toLocaleDateString()} — next payment due {subscription?.subscription_expires_at ? new Date(subscription.subscription_expires_at).toLocaleDateString() : ''}
            </p>
          )}
        </div>
      </div>

      {/* Expiry Warning Banner */}
      {daysRemaining <= 3 && daysRemaining > 0 && (isActive || isTrial) && (
        <div className="px-3 py-2 rounded-xl border bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200">
              {daysRemaining === 1 ? 'Your subscription expires tomorrow!' : `Only ${daysRemaining} days left!`}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              Submit payment now to avoid service interruption.
            </p>
          </div>
          {!pendingPayment && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-orange-600 hover:bg-orange-700 cursor-pointer"
            >
              Pay Now
            </button>
          )}
        </div>
      )}

      {/* Payment Info Card */}
      {config.number && (
        <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <h4 className="text-[10px] font-bold text-slate-900 dark:text-white mb-1.5">Payment Instructions</h4>
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-500 dark:text-slate-400">Network</span>
              <span className="font-semibold text-slate-900 dark:text-white">{config.network}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-500 dark:text-slate-400">Account</span>
              <span className="font-semibold text-slate-900 dark:text-white">{config.name}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-500 dark:text-slate-400">Number</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{config.number}</span>
                <button onClick={handleCopyNumber} className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer">
                  {copied ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <span className="text-slate-500 dark:text-slate-400">Amount</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">GH₵{config.price}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pending Payment */}
      {pendingPayment && (
        <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
          <div className="flex items-start gap-2">
            <Clock className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[10px]">
              <p className="font-semibold text-amber-800 dark:text-amber-200">Payment Under Review</p>
              <p className="text-amber-600 dark:text-amber-400 mt-0.5">
                Transaction: {pendingPayment.transaction_id} • GH₵{pendingPayment.amount} • Submitted {new Date(pendingPayment.created_at).toLocaleDateString()}
              </p>
              {pendingPayment.rejection_reason && (
                <p className="text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                  Rejection reason: {pendingPayment.rejection_reason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="px-2.5 py-1.5 border-b border-slate-200 dark:border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-900 dark:text-white">Payment History</h4>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.slice(0, 5).map((p) => (
              <div key={p.id} className="px-2.5 py-1.5 flex items-center justify-between text-[10px]">
                <div>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{p.transaction_id}</span>
                  <span className="text-slate-400 ml-1.5">GH₵{p.amount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${statusColor(p.status)}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      <Modal
        isOpen={showPaymentForm}
        onClose={() => { setShowPaymentForm(false); setSubmitSuccess(false); setSubmitError(null); }}
        title="Submit Subscription Payment"
        subtitle={`GH₵${config.price} — ${config.network}`}
        maxWidth="md"
      >
        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Payment Submitted!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your payment is pending verification. You will be notified once it&apos;s reviewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {submitError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (GHS) *</label>
              <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} min="1"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Transaction ID *</label>
              <input type="text" required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="e.g. 1234567890"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Date *</label>
              <input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Screenshot *</label>
              <div onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-600 transition-colors">
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain" />
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500">Click to upload</p>
                    <p className="text-[10px] text-slate-400">JPG, PNG, WEBP — max 5MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleScreenshotChange} className="hidden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Note (Optional)</label>
              <textarea rows={2} value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="Additional info..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
            </div>
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setShowPaymentForm(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50">
                {submitting ? (uploading ? 'Uploading...' : 'Submitting...') : 'Submit Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
