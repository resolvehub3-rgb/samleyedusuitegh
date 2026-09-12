import React, { useState, useRef } from 'react';
import {
  CreditCard, Clock, AlertTriangle, Upload, CheckCircle2, ArrowRight,
  FileText, Copy, Check, ExternalLink, Shield, Calendar, XCircle
} from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import { getSupabase } from '../../lib/supabase';
import { formatDaysRemaining } from '../../types/subscription';
import { Modal } from '../common/Modal';

export const SubscriptionExpiredView: React.FC = () => {
  const { subscription, payments, submitPayment, getPaymentConfig, daysRemaining, isSuspended, loading } = useSubscription();
  const { school, logout } = useAuth();
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

    const { error } = await supabase.storage
      .from('payment-screenshots')
      .upload(filePath, screenshotFile, { upsert: false });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!transactionId.trim()) {
      setSubmitError('Transaction ID is required');
      return;
    }
    if (!screenshotFile) {
      setSubmitError('Payment screenshot is required');
      return;
    }
    if (Number(paymentAmount) < 1) {
      setSubmitError('Invalid payment amount');
      return;
    }

    setSubmitting(true);
    setUploading(true);

    try {
      const screenshotUrl = await uploadScreenshot();
      if (!screenshotUrl) {
        setSubmitError('Failed to upload screenshot. Please try again.');
        setSubmitting(false);
        setUploading(false);
        return;
      }

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
        setTransactionId('');
        setPaymentNote('');
        setScreenshotFile(null);
        setScreenshotPreview('');
        setTimeout(() => {
          setShowPaymentForm(false);
          setSubmitSuccess(false);
        }, 3000);
      } else {
        setSubmitError(result.error || 'Payment submission failed');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(config.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center mx-auto mb-4">
            <img src="/logo.png" alt="SamleyEduSuite" className="w-10 h-10 rounded-xl object-contain" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            SamleyEduSuite
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Status Banner */}
          <div className={`px-6 py-4 ${
            isSuspended
              ? 'bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800'
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 ${isSuspended ? 'text-rose-600' : 'text-amber-600'}`} />
              <div>
                <h2 className={`text-sm font-bold ${isSuspended ? 'text-rose-800 dark:text-rose-200' : 'text-amber-800 dark:text-amber-200'}`}>
                  {isSuspended ? 'Subscription Expired' : 'Subscription Status'}
                </h2>
                <p className={`text-xs ${isSuspended ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  Your school&apos;s subscription access has been suspended
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Status Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Status</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {subscription?.status || 'Unknown'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Amount Due</p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                  GH₵{config.price}/month
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Your school&apos;s SamleyEduSuite subscription has expired. Please complete your subscription payment and submit your payment details for verification by the platform administrator. Access will be restored immediately after your payment is approved.
              </p>
            </div>

            {/* Payment Details */}
            {config.number && (
              <div className="p-4 bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 rounded-xl">
                <h4 className="text-xs font-bold text-orange-800 dark:text-orange-200 mb-3 uppercase tracking-wider">
                  Payment Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Network:</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{config.network}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Account Name:</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{config.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">{config.number}</span>
                      <button
                        onClick={handleCopyNumber}
                        className="p-1 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-orange-600" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Amount:</span>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">GH₵{config.price}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Payment Notice */}
            {pendingPayment && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-amber-800 dark:text-amber-200">Payment Under Review</p>
                    <p className="text-amber-600 dark:text-amber-400 mt-0.5">
                      Transaction {pendingPayment.transaction_id} submitted on {new Date(pendingPayment.created_at).toLocaleDateString()}. Awaiting admin verification.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment History */}
            {payments.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Payment History
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {payments.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px]">
                      <div>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">{p.transaction_id}</span>
                        <span className="text-slate-400 ml-2">GH₵{p.amount}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                        p.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {!pendingPayment && (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition-all shadow-lg shadow-orange-600/25 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  Submit Payment
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

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
                Your payment is now pending verification by the platform administrator.
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (GHS) *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="1"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction ID / Reference *
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Screenshot *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-600 transition-colors"
                >
                  {screenshotPreview ? (
                    <img src={screenshotPreview} alt="Screenshot preview" className="max-h-32 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500">Click to upload screenshot</p>
                      <p className="text-[10px] text-slate-400">JPG, PNG or WEBP, max 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Any additional information..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (uploading ? 'Uploading...' : 'Submitting...') : 'Submit Payment'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};
