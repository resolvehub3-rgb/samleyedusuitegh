import React, { useEffect, useState, useCallback } from 'react';
import { Megaphone, PlusCircle, Calendar, Users, Paperclip, CheckCircle2, Trash2 } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Announcement, SchoolClass } from '../../types/database';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { SkeletonCard } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';

export const AnnouncementManagement: React.FC = () => {
  const { school, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'teachers' | 'parents' | 'class'>('all');
  const [targetClassId, setTargetClassId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const supabase = getSupabase();
  const canPublish = profile?.role === 'admin' || profile?.role === 'teacher';

  const fetchAnnouncements = useCallback(async () => {
    if (!school) return;
    try {
      setLoading(true);
      const [annRes, clsRes, platformAnnRes] = await Promise.all([
        supabase
          .from('announcements')
          .select('*, author:profiles!author_id(*)')
          .eq('school_id', school.id)
          .order('created_at', { ascending: false }),
        supabase.from('classes').select('*').eq('school_id', school.id).order('order_index'),
        supabase
          .from('platform_announcements')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false }),
      ]);

      // Merge school announcements with platform announcements, prefixed to distinguish
      const schoolAnns = (annRes.data || []).map((a: any) => ({ ...a, _type: 'school' }));
      const platformAnns = (platformAnnRes.data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        target_audience: a.target === 'all' ? 'all' : a.target === 'teachers' ? 'teachers' : a.target === 'parents' ? 'parents' : 'all',
        created_at: a.created_at,
        author: { full_name: 'Platform Admin' },
        _type: 'platform',
      }));

      setAnnouncements([...platformAnns, ...schoolAnns] as any);
      setClasses((clsRes.data || []) as SchoolClass[]);
      if (clsRes.data && clsRes.data.length > 0 && !targetClassId) {
        setTargetClassId(clsRes.data[0].id);
      }
    } catch (e) {
      console.error('Error fetching announcements:', e);
    } finally {
      setLoading(false);
    }
  }, [school, supabase]);

  useEffect(() => {
    fetchAnnouncements();

    if (!school) return;
    // Realtime announcements (school-level)
    const channel = supabase
      .channel(`announcements_${school.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements', filter: `school_id=eq.${school.id}` }, () => {
        fetchAnnouncements();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_announcements' }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [school, supabase, fetchAnnouncements]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !profile || !title || !content) return;

    setSubmitting(true);
    try {
      const { data: newAnn, error } = await supabase.from('announcements').insert({
        school_id: school.id,
        author_id: profile.id,
        title: title.trim(),
        content: content.trim(),
        target_audience: targetAudience,
        target_class_id: targetAudience === 'class' ? targetClassId : null,
        expires_at: expiresAt || null,
        attachment_url: attachmentUrl.trim() || null
      }).select().single();

      if (error) {
        alert(`Error publishing announcement: ${error.message}`);
      } else {
        // Broadcast notification to targeted users
        // 1. Fetch user IDs in target group
        let userQuery = supabase.from('profiles').select('id').eq('school_id', school.id);
        if (targetAudience === 'teachers') userQuery = userQuery.eq('role', 'teacher');
        if (targetAudience === 'parents') userQuery = userQuery.eq('role', 'parent');

        const { data: targetUsers } = await userQuery;

        if (targetUsers && targetUsers.length > 0) {
          const notifs = targetUsers.map((u) => ({
            school_id: school.id,
            user_id: u.id,
            type: 'announcement',
            title: `Announcement: ${title}`,
            message: content.slice(0, 140),
            related_record_id: newAnn.id
          }));
          await supabase.from('notifications').insert(notifs);
        }

        setIsModalOpen(false);
        setTitle('');
        setContent('');
        setAttachmentUrl('');
        fetchAnnouncements();
      }
    } catch (err: any) {
      alert(`Exception: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await supabase.from('announcements').delete().eq('id', id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            School Announcements & Notices
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Realtime school broadcasts for Parents, Teachers, and Specific Class Streams
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Publish Announcement
          </button>
        )}
      </div>

      {/* Announcements Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements published yet"
          description="Keep parents and teachers informed about PTA meetings, sports days, midterm breaks, and school events."
          actionLabel={canPublish ? 'Publish First Notice' : undefined}
          onAction={canPublish ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={
                        ann.target_audience === 'all'
                          ? 'primary'
                          : ann.target_audience === 'parents'
                          ? 'success'
                          : 'info'
                      }
                      size="sm"
                    >
                      Audience: {ann.target_audience.toUpperCase()}
                    </Badge>
                    {(ann as any)._type === 'platform' && (
                      <Badge variant="warning" size="sm">Platform</Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {ann.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>

                {ann.attachment_url && (
                  <div className="mt-3">
                    <a
                      href={ann.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> View Notice Attachment
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>By: {(ann as any).author?.full_name || 'Administration'}</span>
                {canPublish && (
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md cursor-pointer transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish School Announcement"
        subtitle="Broadcast notices to parents and teachers in real-time"
        maxWidth="md"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. End of Term PTA General Meeting & Speech Day"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Audience *
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="all">Entire School (All)</option>
                <option value="parents">Parents Only</option>
                <option value="teachers">Teachers Only</option>
                <option value="class">Specific Class Stream</option>
              </select>
            </div>

            {targetAudience === 'class' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Class
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notice Content / Details *
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full announcement text here..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document / Circular Attachment URL (Optional)
            </label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://... (Supabase Storage file link or PDF URL)"
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
              {submitting ? 'Broadcasting...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
