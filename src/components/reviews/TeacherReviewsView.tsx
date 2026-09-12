import React, { useEffect, useState, useCallback } from 'react';
import { Star, PlusCircle, UserCheck, MessageSquare, Filter, ShieldCheck } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { TeacherReview, Profile, Student } from '../../types/database';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { SkeletonCard } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';

export const TeacherReviewsView: React.FC = () => {
  const { school, profile } = useAuth();
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [myWards, setMyWards] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [filterRating, setFilterRating] = useState<string>('ALL');

  // New Review Modal for Parents
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const supabase = getSupabase();
  const isParent = profile?.role === 'parent';
  const isTeacher = profile?.role === 'teacher';

  const fetchReviews = useCallback(async () => {
    if (!school) return;
    try {
      setLoading(true);

      let query = supabase
        .from('teacher_reviews')
        .select('*, teacher:profiles!teacher_id(*), parent:profiles!parent_id(*), student:students(*)')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false });

      if (isTeacher && profile) {
        query = query.eq('teacher_id', profile.id);
      } else if (isParent && profile) {
        query = query.eq('parent_id', profile.id);
      }

      const [revRes, teachRes] = await Promise.all([
        query,
        supabase.from('profiles').select('*').eq('school_id', school.id).eq('role', 'teacher')
      ]);

      setReviews((revRes.data || []) as any);
      setTeachers((teachRes.data || []) as Profile[]);

      // If parent, fetch their linked wards
      if (isParent && profile) {
        const { data: rels } = await supabase
          .from('parent_students')
          .select('student:students(*)')
          .eq('parent_id', profile.id);

        const wards = (rels || []).map((r: any) => r.student).filter(Boolean);
        setMyWards(wards as Student[]);
        if (wards.length > 0) setSelectedWardId(wards[0].id);
      }

      if (teachRes.data && teachRes.data.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(teachRes.data[0].id);
      }
    } catch (e) {
      console.error('Error loading reviews:', e);
    } finally {
      setLoading(false);
    }
  }, [school, profile, isParent, isTeacher, supabase]);

  useEffect(() => {
    fetchReviews();

    if (!school) return;
    const channel = supabase
      .channel(`reviews_${school.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teacher_reviews', filter: `school_id=eq.${school.id}` }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [school, supabase, fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !profile || !selectedTeacherId || !selectedWardId || !reviewText) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('teacher_reviews').insert({
        school_id: school.id,
        teacher_id: selectedTeacherId,
        parent_id: profile.id,
        student_id: selectedWardId,
        rating,
        review_text: reviewText.trim(),
        academic_year: '2025/2026',
        term: 'Term 1'
      });

      if (error) {
        alert(error.message);
      } else {
        // Send notification to teacher
        await supabase.from('notifications').insert({
          school_id: school.id,
          user_id: selectedTeacherId,
          type: 'review',
          title: 'New Parent Review Received',
          message: `${profile.full_name} submitted a ${rating}-star feedback regarding classroom teaching.`
        });

        setIsModalOpen(false);
        setReviewText('');
        fetchReviews();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'ALL') return true;
    return r.rating === Number(filterRating);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Teacher Reviews & Ratings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Confidential feedback and pedagogical appraisals submitted by parents
          </p>
        </div>

        {isParent && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Submit Review for Class Teacher
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Showing {filteredReviews.length} reviews
        </span>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Star Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews recorded"
          description={
            isParent
              ? "Share your appraisal of your child's class teacher to help support classroom excellence."
              : 'Parents can rate and review class teachers from their parent portal.'
          }
          actionLabel={isParent ? 'Submit First Review' : undefined}
          onAction={isParent ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => {
            const teacher = (rev as any).teacher;
            const parent = (rev as any).parent;
            const student = (rev as any).student;

            return (
              <div
                key={rev.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic mt-2">
                    &ldquo;{rev.review_text}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Teacher:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {teacher?.full_name || 'Class Teacher'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Ward / Parent:</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {student ? `${student.first_name}` : 'Pupil'} ({parent?.full_name || 'Parent'})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Parent Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Teacher Review"
        subtitle="Appraise your child's class teacher"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Ward / Child *
            </label>
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {myWards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.first_name} {w.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Teacher *
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.qualification || 'Teacher'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Star Rating (1 to 5)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Feedback & Comments *
            </label>
            <textarea
              rows={3}
              required
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="e.g. Very patient with my child, communicative regarding homework..."
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
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
