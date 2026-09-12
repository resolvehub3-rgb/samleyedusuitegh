import React, { useEffect } from 'react';
import { HardDrive, Folder, File, RefreshCw, Globe, Lock } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { SkeletonCard } from '../common/SkeletonLoader';

export const SuperAdminStorage: React.FC = () => {
  const { storageBuckets, fetchStorageBuckets, loading } = useSuperAdmin();

  useEffect(() => { fetchStorageBuckets(); }, [fetchStorageBuckets]);

  if (loading && storageBuckets.length === 0) {
    return (
      <div className="space-y-5">
        <SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Storage Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Platform storage buckets and file management</p>
        </div>
        <button
          onClick={fetchStorageBuckets}
          className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {storageBuckets.length === 0 ? (
        <EmptyState
          icon={HardDrive}
          title="No storage buckets"
          description="Storage buckets configured in your Supabase project will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {storageBuckets.map((bucket) => (
            <div key={bucket.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{bucket.name}</h3>
                    <p className="text-[11px] text-slate-400">ID: {bucket.id}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={bucket.public ? 'success' : 'neutral'} size="sm">
                  {bucket.public ? <><Globe className="w-3 h-3" /> Public</> : <><Lock className="w-3 h-3" /> Private</>}
                </Badge>
              </div>
              {bucket.created_at && (
                <p className="text-[10px] text-slate-400 mt-2">
                  Created: {new Date(bucket.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Storage Guidelines</h3>
        <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <li>• School logos are stored in the <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">school-assets</code> bucket</li>
          <li>• Student and teacher images are stored per-school</li>
          <li>• Public buckets allow direct file access via URL</li>
          <li>• Private buckets require authenticated access</li>
          <li>• File deletion requires confirmation and proper authorization</li>
        </ul>
      </div>
    </div>
  );
};
