import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  CreditCard, 
  Award, 
  CalendarCheck, 
  Megaphone, 
  MessageSquare, 
  Star, 
  ArrowRight,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Student, PaymentRecord, AttendanceRecord, Announcement } from '../../types/database';
import { Badge } from '../common/Badge';
import { StatCard } from '../common/StatCard';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';

interface ParentDashboardProps {
  onNavigate: (view: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const { school, profile, schoolSettings } = useAuth();
  const [wards, setWards] = useState<(Student & { current_class?: any })[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Ward Metrics
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceRate, setAttendanceRate] = useState('0%');
  const [feeBalance, setFeeBalance] = useState(0);
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [terminalReportStatus, setTerminalReportStatus] = useState<'approved' | 'pending' | 'not_available'>('not_available');
  const [terminalReportTerm, setTerminalReportTerm] = useState<string>('');
  const [terminalReportYear, setTerminalReportYear] = useState<string>('');

  // Mobile Money Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payChannel, setPayChannel] = useState<'MTN Mobile Money' | 'Vodafone Cash' | 'AirtelTigo Money'>('MTN Mobile Money');
  const [momoRef, setMomoRef] = useState('');
  const [payingFee, setPayingFee] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // Payment proof screenshot
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [proofError, setProofError] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch linked wards
  const fetchWards = useCallback(async () => {
    if (!school || !profile) return;
    try {
      setLoading(true);
      const { data: rels, error } = await supabase
        .from('parent_students')
        .select('student:students(*, current_class:classes(*))')
        .eq('parent_id', profile.id);

      const list = (rels || []).map((r: any) => r.student).filter(Boolean);
      setWards(list);

      if (list.length > 0) {
        setSelectedWardId(list[0].id);
      }
    } catch (e) {
      console.error('Error fetching wards:', e);
    } finally {
      setLoading(false);
    }
  }, [school, profile, supabase]);

  useEffect(() => {
    fetchWards();
  }, [fetchWards]);

  // 2. Fetch selected ward's stats
  const fetchWardStats = useCallback(async () => {
    if (!school || !selectedWardId) return;
    try {
      const [todayAttRes, allAttRes, payRes, annRes] = await Promise.all([
        supabase
          .from('attendance')
          .select('*')
          .eq('school_id', school.id)
          .eq('student_id', selectedWardId)
          .eq('date', today)
          .maybeSingle(),
        supabase
          .from('attendance')
          .select('status')
          .eq('school_id', school.id)
          .eq('student_id', selectedWardId),
        supabase
          .from('payments')
          .select('*')
          .eq('school_id', school.id)
          .eq('student_id', selectedWardId)
          .order('created_at', { ascending: false }),
        supabase
          .from('announcements')
          .select('*')
          .eq('school_id', school.id)
          .in('target_audience', ['all', 'parents'])
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      setTodayAttendance(todayAttRes.data as any);

      const allAtt = allAttRes.data || [];
      const presentDays = allAtt.filter((a: any) => a.status === 'present').length;
      setAttendanceRate(allAtt.length > 0 ? `${Math.round((presentDays / allAtt.length) * 100)}%` : '100%');

      setRecentPayments((payRes.data || []) as any);
      setRecentAnnouncements((annRes.data || []) as any);

      // Fetch terminal report status for selected ward
      if (selectedWardId) {
        const { data: reportRes } = await supabase
          .from('terminal_reports')
          .select('is_approved, term, academic_year')
          .eq('school_id', school.id)
          .eq('student_id', selectedWardId)
          .maybeSingle();
        
        if (reportRes) {
          setTerminalReportStatus(reportRes.is_approved ? 'approved' : 'pending');
          setTerminalReportTerm(reportRes.term || '');
          setTerminalReportYear(reportRes.academic_year || '');
        } else {
          setTerminalReportStatus('not_available');
          setTerminalReportTerm('');
          setTerminalReportYear('');
        }
      }

      // Pending fee balance
      const pendingFees = (payRes.data || [])
        .filter((p: any) => p.status === 'pending')
        .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      setFeeBalance(pendingFees);
    } catch (e) {
      console.error('Error fetching ward stats:', e);
    }
  }, [school, selectedWardId, today, supabase]);

  useEffect(() => {
    if (selectedWardId) {
      fetchWardStats();
    }
  }, [selectedWardId, fetchWardStats]);

  const selectedWard = wards.find((w) => w.id === selectedWardId);

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProofError('Screenshot must be less than 5MB.');
      return;
    }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setProofError('Screenshot must be a JPG, PNG, or WEBP image.');
      return;
    }
    setProofFile(file);
    setProofError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearProofFile = () => {
    setProofFile(null);
    setProofPreview('');
    setProofError(null);
  };

  const uploadProofScreenshot = async (): Promise<string | null> => {
    if (!proofFile || !school) return null;
    const fileExt = proofFile.name.split('.').pop() || 'jpg';
    const filePath = `payment-screenshots/${school.id}/${profile?.id || 'parent'}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('payment-screenshots')
      .upload(filePath, proofFile, { upsert: false });
    if (error) {
      console.error('Screenshot upload failed:', error.message);
      return null;
    }
    const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  };

  const handleMobileMoneyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !profile || !selectedWardId || !payAmount) return;

    if (!proofFile) {
      setProofError('Please upload a screenshot of your payment as proof of transaction.');
      return;
    }

    setPayingFee(true);
    setPaySuccess(false);
    setUploadingProof(true);

    try {
      // Upload proof-of-payment screenshot to storage
      const proofUrl = await uploadProofScreenshot();
      if (!proofUrl) {
        setProofError('Failed to upload the screenshot. Please try again.');
        setPayingFee(false);
        setUploadingProof(false);
        return;
      }
      setUploadingProof(false);

      const invNum = `PAY-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from('payments').insert({
        school_id: school.id,
        student_id: selectedWardId,
        parent_id: profile.id,
        invoice_number: invNum,
        amount: Number(payAmount),
        currency: 'GHS',
        purpose: 'School Fees & Tuition Payment',
        payment_method: payChannel,
        transaction_reference: proofUrl,
        status: 'pending'
      });

      if (error) {
        alert(error.message);
      } else {
        setPaySuccess(true);
        setTimeout(() => {
          setIsPayModalOpen(false);
          setPayAmount('');
          setMomoRef('');
          clearProofFile();
          setPaySuccess(false);
          fetchWardStats();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPayingFee(false);
      setUploadingProof(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading parent portal...</div>;
  }

  if (wards.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No wards linked to your account"
        description="Please contact your school administrator to link your parent profile to your enrolled children."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Ward Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
            Parent Portal • Ghanaian Private School
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Welcome, {profile?.full_name}
          </h2>
          <p className="text-xs text-slate-500">
            Select your ward to review attendance, fee balances, and continuous assessment report cards.
          </p>
        </div>

        {/* Multi-Ward Selector */}
        {wards.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Active Ward:
            </span>
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.first_name} {w.last_name} ({w.current_class?.name || 'Class'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Ward Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Class"
          value={selectedWard?.current_class?.name || 'Assigned Class'}
          subtitle={`Curriculum: ${selectedWard?.current_class?.stage || 'Ghana Basic'}`}
          icon={Users}
        />
        <StatCard
          title="Today's Attendance"
          value={
            todayAttendance
              ? todayAttendance.status.toUpperCase()
              : 'NOT MARKED'
          }
          subtitle={`Term Attendance: ${attendanceRate}`}
          icon={CalendarCheck}
        />
        <StatCard
          title="Pending Fee Balance"
          value={`GHS ${feeBalance.toFixed(2)}`}
          subtitle="Ghanaian Cedis (GHS)"
          icon={CreditCard}
        />
        <StatCard
          title="Terminal Report"
          value={
            terminalReportStatus === 'approved' 
              ? 'Approved' 
              : terminalReportStatus === 'pending' 
                ? 'Pending' 
                : 'Not Ready'
          }
          subtitle={terminalReportStatus === 'approved' 
            ? `${terminalReportYear} ${terminalReportTerm}`
            : `${schoolSettings?.active_academic_year} ${schoolSettings?.active_term}`
          }
          icon={terminalReportStatus === 'approved' ? Award : terminalReportStatus === 'pending' ? AlertCircle : FileSpreadsheet}
        />
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setIsPayModalOpen(true)}
          className="p-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors flex items-center justify-between cursor-pointer"
        >
          <div className="text-left">
            <span className="text-[11px] uppercase tracking-wider opacity-80 font-bold block">
              School Fees
            </span>
            <span className="text-sm font-bold">Pay via MoMo</span>
          </div>
          <CreditCard className="w-5 h-5 opacity-90" />
        </button>

        <button
          onClick={() => onNavigate('terminal-reports')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs transition-colors flex items-center justify-between cursor-pointer"
        >
          <div className="text-left">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Academics
            </span>
            <span className="text-sm font-bold">A4 Report Card</span>
          </div>
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
        </button>

        <button
          onClick={() => onNavigate('teacher-reviews')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs transition-colors flex items-center justify-between cursor-pointer"
        >
          <div className="text-left">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Feedback
            </span>
            <span className="text-sm font-bold">Rate Teacher</span>
          </div>
          <Star className="w-5 h-5 text-amber-500" />
        </button>

        <button
          onClick={() => onNavigate('parent-feedback')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs transition-colors flex items-center justify-between cursor-pointer"
        >
          <div className="text-left">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Helpdesk
            </span>
            <span className="text-sm font-bold">Contact School</span>
          </div>
          <MessageSquare className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* Split View: Recent Payments & School Circulars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Fee Receipts & Transactions
            </h3>
            <span className="text-xs text-slate-400">
              Ward: {selectedWard?.first_name}
            </span>
          </div>

          {recentPayments.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No transactions recorded for this ward yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPayments.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {p.purpose}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {p.payment_method} • Ref: {p.transaction_reference || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white block">
                      GHS {Number(p.amount).toFixed(2)}
                    </span>
                    <Badge
                      variant={p.status === 'verified' || p.status === 'paid' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* School Announcements for Parents */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Notices from Administration
            </h3>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              View All
            </button>
          </div>

          {recentAnnouncements.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No recent announcements.
            </p>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">{ann.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pay Fees via Mobile Money Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Pay School Fees via Mobile Money"
        subtitle={`Making payment for ${selectedWard?.first_name} ${selectedWard?.last_name}`}
        maxWidth="md"
      >
        <form onSubmit={handleMobileMoneyPayment} className="space-y-4">
          {/* School Merchant Account Box */}
          <div className="p-3.5 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-xl text-xs space-y-1 text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-orange-700 dark:text-orange-400">
              <Phone className="w-4 h-4" /> Official School Payment Credentials:
            </div>
            <p>
              <strong>MoMo Pay / Number:</strong> {schoolSettings?.momo_number || '024 123 4567'}
            </p>
            <p>
              <strong>Registered Name:</strong> {schoolSettings?.momo_merchant_name || school?.name}
            </p>
            {schoolSettings?.bank_name && (
              <p>
                <strong>Bank Account:</strong> {schoolSettings.bank_name} - {schoolSettings.bank_account_number} ({schoolSettings.bank_branch})
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Network / Channel *
            </label>
            <select
              value={payChannel}
              onChange={(e) => setPayChannel(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            >
              <option value="MTN Mobile Money">MTN MoMo (*170#)</option>
              <option value="Vodafone Cash">Telecel (Vodafone) Cash (*110#)</option>
              <option value="AirtelTigo Money">AT Money (*110#)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount to Pay (Ghanaian Cedis - GHS) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="e.g. 500.00"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Proof of Transaction Screenshot *
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Upload a screenshot of your Mobile Money / Bank confirmation (SMS alert or app receipt) as proof of payment. JPG, PNG, or WEBP — max 5MB.
            </p>
            {proofPreview ? (
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                <img src={proofPreview} alt="Payment proof preview" className="w-full max-h-48 object-contain" />
                <button
                  type="button"
                  onClick={clearProofFile}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-rose-600 cursor-pointer"
                  title="Remove screenshot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="px-3 py-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="truncate">{proofFile?.name}</span>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full py-6 px-4 bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-orange-400 dark:hover:border-orange-600 cursor-pointer transition-colors">
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Click to upload payment screenshot
                </span>
                <span className="text-[10px] text-slate-400">JPG, PNG, or WEBP — max 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleProofFileChange}
                />
              </label>
            )}
            {proofError && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2 text-[11px] text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{proofError}</span>
              </div>
            )}
          </div>

          {paySuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Payment submitted! Administration will verify shortly.
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={payingFee || uploadingProof}
              className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {uploadingProof ? 'Uploading screenshot...' : payingFee ? 'Submitting...' : 'Submit Payment for Verification'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
