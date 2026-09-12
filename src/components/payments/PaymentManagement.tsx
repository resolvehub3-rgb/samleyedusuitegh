import React, { useEffect, useState, useCallback } from 'react';
import { 
  CreditCard, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  FileText, 
  Search, 
  Filter,
  Check,
  Building2,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PaymentRecord, Student, SchoolClass } from '../../types/database';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { SkeletonTable } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';

export const PaymentManagement: React.FC = () => {
  const { school, profile } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Invoice Modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('Term 1 Tuition & Facility Fees');
  const [paymentMethod, setPaymentMethod] = useState<'MTN Mobile Money' | 'Vodafone Cash' | 'AirtelTigo Money' | 'Bank Transfer' | 'Cash'>('MTN Mobile Money');
  const [transactionRef, setTransactionRef] = useState('');
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  // Payment proof screenshot viewer
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);

  const supabase = getSupabase();

  const fetchPaymentsData = useCallback(async () => {
    if (!school) return;
    try {
      setLoading(true);
      const [payRes, stdRes] = await Promise.all([
        supabase
          .from('payments')
          .select('*, student:students(*, current_class:classes(*)), parent:profiles!parent_id(*)')
          .eq('school_id', school.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('students')
          .select('*, current_class:classes(*)')
          .eq('school_id', school.id)
          .eq('status', 'active')
          .order('last_name')
      ]);

      setPayments((payRes.data || []) as any);
      setStudents((stdRes.data || []) as any);
      if (stdRes.data && stdRes.data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stdRes.data[0].id);
      }
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setLoading(false);
    }
  }, [school, supabase]);

  useEffect(() => {
    fetchPaymentsData();

    if (!school) return;
    // Realtime payment updates
    const channel = supabase
      .channel(`payments_admin_${school.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `school_id=eq.${school.id}` }, () => {
        fetchPaymentsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [school, supabase, fetchPaymentsData]);

  const handleVerifyPayment = async (paymentId: string, parentId?: string, studentName?: string) => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'verified',
          verified_by: profile.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        alert(`Verification failed: ${error.message}`);
      } else {
        // Realtime notification to parent
        if (parentId) {
          await supabase.from('notifications').insert({
            school_id: school?.id,
            user_id: parentId,
            type: 'payment',
            title: 'School Fee Payment Verified',
            message: `Your payment for ${studentName || 'your ward'} has been officially verified and credited by school administration.`
          });
        }
        fetchPaymentsData();
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !selectedStudentId || !amount) return;

    setSubmittingInvoice(true);
    try {
      const invNum = `INV-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from('payments').insert({
        school_id: school.id,
        student_id: selectedStudentId,
        invoice_number: invNum,
        amount: Number(amount),
        currency: 'GHS',
        purpose,
        payment_method: paymentMethod,
        transaction_reference: transactionRef.trim() || `REF-${Date.now().toString().slice(-6)}`,
        status: 'pending'
      });

      if (error) {
        alert(`Error creating invoice: ${error.message}`);
      } else {
        setIsInvoiceModalOpen(false);
        setAmount('');
        setTransactionRef('');
        fetchPaymentsData();
      }
    } catch (err: any) {
      alert(`Exception: ${err.message}`);
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const student = (p as any).student;
    const sName = student ? `${student.first_name} ${student.last_name}`.toLowerCase() : '';
    const matchSearch =
      sName.includes(searchQuery.toLowerCase()) ||
      p.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.transaction_reference && p.transaction_reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.purpose.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalVerified = payments
    .filter((p) => p.status === 'verified' || p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            School Fee Payments (Ghanaian Cedis)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track Mobile Money (MTN MoMo, Telecel Cash, AT Money) and Bank deposit transactions
          </p>
        </div>
        <button
          onClick={() => setIsInvoiceModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Record Payment / Invoice
        </button>
      </div>

      {/* Summary totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Revenue</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            GHS {totalVerified.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Verification</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            GHS {totalPending.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Transactions</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {payments.length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, invoice #, or transaction reference..."
            className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-800 dark:text-slate-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
        >
          <option value="ALL">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records found"
          description="Record student school fees or wait for parents to make payments via Mobile Money."
          actionLabel="Record New Payment"
          onAction={() => setIsInvoiceModalOpen(true)}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice / Ref</th>
                  <th className="py-3 px-4">Pupil & Class</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Amount (GHS)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map((p) => {
                  const student = (p as any).student;
                  const parent = (p as any).parent;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <p className="font-mono font-semibold text-slate-900 dark:text-white">
                          {p.invoice_number}
                        </p>
                        {p.transaction_reference && p.transaction_reference.startsWith('http') ? (
                          <button
                            onClick={() => setProofImageUrl(p.transaction_reference!)}
                            className="text-[10px] font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3" /> View Proof
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Ref: {p.transaction_reference || 'N/A'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}
                        </p>
                        <span className="text-[10px] text-slate-500">
                          {student?.current_class?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {p.purpose}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <span className="font-medium">{p.payment_method}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        GHS {Number(p.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            p.status === 'verified' || p.status === 'paid'
                              ? 'success'
                              : p.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.status === 'pending' && (
                          <button
                            onClick={() =>
                              handleVerifyPayment(
                                p.id,
                                p.parent_id,
                                student ? `${student.first_name} ${student.last_name}` : undefined
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Verify
                          </button>
                        )}
                        {(p.status === 'verified' || p.status === 'paid') && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Invoice / Payment Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Record Fee Payment / Issue Invoice"
        subtitle="Generate Ghanaian Cedis fee billing or record receipt"
        maxWidth="md"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Student *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.first_name} {std.last_name} ({std.current_class?.name || 'Class'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount (GHS) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 850.00"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="MTN Mobile Money">MTN MoMo</option>
                <option value="Vodafone Cash">Telecel (Vodafone) Cash</option>
                <option value="AirtelTigo Money">AT Money</option>
                <option value="Bank Transfer">Bank Transfer / Deposit</option>
                <option value="Cash">Cash at Bursar Office</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Purpose / Fee Item *
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Term 1 Tuition, PTA Levy, Computer Lab Fee"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mobile Money / Bank Transaction Reference
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. MoMo Transaction ID: 298471928"
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingInvoice}
              className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {submittingInvoice ? 'Recording...' : 'Record Payment Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Proof Screenshot Viewer */}
      <Modal
        isOpen={!!proofImageUrl}
        onClose={() => setProofImageUrl(null)}
        title="Proof of Transaction"
        subtitle="Screenshot uploaded by the parent"
        maxWidth="md"
      >
        {proofImageUrl && (
          <img
            src={proofImageUrl}
            alt="Payment proof screenshot"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 max-h-[60vh] object-contain bg-slate-100 dark:bg-slate-800"
          />
        )}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <a
            href={proofImageUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Open Original
          </a>
          <button
            type="button"
            onClick={() => setProofImageUrl(null)}
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};
