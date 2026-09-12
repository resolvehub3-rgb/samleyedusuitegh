import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquare, PlusCircle, Send, CheckCircle2, Clock, HelpCircle, AlertCircle } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ParentFeedback, Profile } from '../../types/database';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { SkeletonCard } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';

export const ParentFeedbackView: React.FC = () => {
  const { school, profile } = useAuth();
  const [feedbackList, setFeedbackList] = useState<ParentFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // New feedback modal for parents
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<'Academic' | 'Facilities' | 'Transport' | 'Fees' | 'Discipline' | 'Other'>('Academic');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin Response
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const supabase = getSupabase();
  const isAdmin = profile?.role === 'admin';
  const isParent = profile?.role === 'parent';

  const fetchFeedback = useCallback(async () => {
    if (!school) return;
    try {
      setLoading(true);
      let query = supabase
        .from('parent_feedback')
        .select('*, parent:profiles!parent_id(*)')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false });

      if (isParent && profile) {
        query = query.eq('parent_id', profile.id);
      }

      const { data, error } = await query;
      if (data) setFeedbackList(data as any);
    } catch (e) {
      console.error('Error fetching feedback:', e);
    } finally {
      setLoading(false);
    }
  }, [school, profile, isParent, supabase]);

  useEffect(() => {
    fetchFeedback();

    if (!school) return;
    const channel = supabase
      .channel(`feedback_${school.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parent_feedback', filter: `school_id=eq.${school.id}` }, () => {
        fetchFeedback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [school, supabase, fetchFeedback]);

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !profile || !message) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('parent_feedback').insert({
        school_id: school.id,
        parent_id: profile.id,
        category,
        message: message.trim(),
        status: 'open'
      }).select().single();

      if (error) {
        alert(error.message);
      } else {
        // Send notification to school admin
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('school_id', school.id)
          .eq('role', 'admin');

        if (admins && admins.length > 0) {
          const notifs = admins.map((adm) => ({
            school_id: school.id,
            user_id: adm.id,
            type: 'feedback',
            title: `New Parent Inquiry (${category})`,
            message: `${profile.full_name} submitted: "${message.slice(0, 80)}..."`,
            related_record_id: data.id
          }));
          await supabase.from('notifications').insert(notifs);
        }

        setIsModalOpen(false);
        setMessage('');
        fetchFeedback();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (fb: ParentFeedback) => {
    if (!profile || !replyText.trim()) return;
    setReplying(true);

    try {
      const { error } = await supabase
        .from('parent_feedback')
        .update({
          admin_response: replyText.trim(),
          status: 'resolved',
          responded_by: profile.id,
          responded_at: new Date().toISOString()
        })
        .eq('id', fb.id);

      if (error) {
        alert(error.message);
      } else {
        // Notify parent
        await supabase.from('notifications').insert({
          school_id: school?.id,
          user_id: fb.parent_id,
          type: 'feedback',
          title: `School Response to your ${fb.category} Inquiry`,
          message: replyText.slice(0, 140)
        });

        setReplyId(null);
        setReplyText('');
        fetchFeedback();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Parent Inquiries & Helpdesk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official communication channel between parents and school leadership
          </p>
        </div>

        {isParent && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Send Inquiry / Feedback
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : feedbackList.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No inquiries found"
          description={
            isParent
              ? 'Have questions about academics, school transport, or school fees? Submit an inquiry directly to administration.'
              : 'Parents have not submitted any inquiries or feedback yet.'
          }
          actionLabel={isParent ? 'Submit Inquiry' : undefined}
          onAction={isParent ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {feedbackList.map((fb) => {
            const parent = (fb as any).parent;
            return (
              <div
                key={fb.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        fb.status === 'resolved'
                          ? 'success'
                          : fb.status === 'in_review'
                          ? 'warning'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {fb.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {fb.category}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Submitted: {new Date(fb.created_at).toLocaleString()}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">
                    Parent Message ({parent?.full_name || 'Parent'}):
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {fb.message}
                  </p>
                </div>

                {fb.admin_response ? (
                  <div className="pl-4 border-l-2 border-emerald-500 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Administration Official Response:
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {fb.admin_response}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Responded at: {fb.responded_at ? new Date(fb.responded_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                ) : isAdmin ? (
                  <div>
                    {replyId === fb.id ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type official school response to parent..."
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setReplyId(null)}
                            className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendReply(fb)}
                            disabled={replying || !replyText.trim()}
                            className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {replying ? 'Sending...' : 'Send Response & Resolve'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyId(fb.id);
                          setReplyText('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Respond to Parent
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" /> Awaiting administration review...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Feedback Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Inquiry to School"
        subtitle="Direct channel to school administration"
        maxWidth="md"
      >
        <form onSubmit={handleCreateFeedback} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Inquiry Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Academic">Academic & Curriculum</option>
              <option value="Fees">School Fees & Payments</option>
              <option value="Facilities">School Facilities & Safety</option>
              <option value="Transport">School Bus & Transport</option>
              <option value="Discipline">Discipline & Conduct</option>
              <option value="Other">General Question / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Message / Details *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your inquiry or feedback clearly..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Send Inquiry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
