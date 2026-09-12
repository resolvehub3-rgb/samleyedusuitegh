import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Eye, EyeOff, Calendar, Users, Target } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SuperAdminAnnouncements: React.FC = () => {
  const { announcements, fetchAnnouncements, createAnnouncement, deleteAnnouncement, toggleAnnouncementPublish, loading } = useSuperAdmin();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all');
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    setCreating(true);
    const success = await createAnnouncement({ title: title.trim(), content: content.trim(), target });
    if (success) {
      setShowCreate(false);
      setTitle(''); setContent(''); setTarget('all');
    }
    setCreating(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await deleteAnnouncement(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  const targetLabel = (t: string) => {
    switch (t) {
      case 'all': return 'All Users';
      case 'school_admins': return 'School Admins';
      case 'teachers': return 'Teachers';
      case 'parents': return 'Parents';
      default: return t;
    }
  };

  if (loading && announcements.length === 0) return <SkeletonTable rows={6} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Platform Announcements</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Create and manage platform-wide announcements</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Create your first platform announcement to broadcast to all schools."
          actionLabel="Create Announcement"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ann.title}</h3>
                    <Badge variant={ann.is_published ? 'success' : 'warning'} size="sm">
                      {ann.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="info" size="sm">
                      <Target className="w-3 h-3" /> {targetLabel(ann.target)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">{ann.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(ann as any).author?.full_name || 'Super Admin'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ann.created_at).toLocaleDateString()}</span>
                    {ann.published_at && <span>Published {new Date(ann.published_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleAnnouncementPublish(ann.id, !ann.is_published)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      ann.is_published ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                    title={ann.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {ann.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteId(ann.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Platform Announcement" maxWidth="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title..." className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6}
              placeholder="Write your announcement..." className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Audience</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer">
              <option value="all">All Users</option>
              <option value="school_admins">School Admins</option>
              <option value="teachers">Teachers</option>
              <option value="parents">Parents</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer">Cancel</button>
            <button onClick={handleCreate} disabled={creating || !title.trim() || !content.trim()}
              className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl cursor-pointer">
              {creating ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Announcement" message="Are you sure you want to delete this announcement? This cannot be undone."
        confirmLabel="Delete" variant="danger" loading={deleting} />
    </div>
  );
};
