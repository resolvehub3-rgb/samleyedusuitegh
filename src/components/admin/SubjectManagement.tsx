import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, PlusCircle, CheckCircle2, BookmarkCheck } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Subject } from '../../types/database';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { SkeletonTable } from '../common/SkeletonLoader';

export const SubjectManagement: React.FC = () => {
  const { school } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isCore, setIsCore] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = getSupabase();

  const fetchSubjects = useCallback(async () => {
    if (!school) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('school_id', school.id)
        .order('is_core', { ascending: false })
        .order('name');

      if (data) setSubjects(data as Subject[]);
    } catch (e) {
      console.error('Error fetching subjects:', e);
    } finally {
      setLoading(false);
    }
  }, [school, supabase]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !name) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('subjects').insert({
        school_id: school.id,
        name: name.trim(),
        code: (code.trim() || name.slice(0, 4)).toUpperCase(),
        is_core: isCore
      });

      if (error) {
        alert(error.message);
      } else {
        setIsModalOpen(false);
        setName('');
        setCode('');
        fetchSubjects();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subject Curriculum Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Core Ghanaian National Curriculum and school elective courses
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${sub.is_core ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {sub.name}
                  </h4>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">
                    Code: {sub.code || 'N/A'}
                  </span>
                </div>
              </div>
              <Badge variant={sub.is_core ? 'primary' : 'neutral'} size="sm">
                {sub.is_core ? 'Core Subject' : 'Elective'}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Subject to Curriculum"
        subtitle="Define new subject for grading and reports"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computing / Robotics"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject Code (Abbreviation)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. COMP"
              className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isCore}
                onChange={(e) => setIsCore(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span>Compulsory / Core Ghanaian Curriculum Subject</span>
            </label>
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
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
