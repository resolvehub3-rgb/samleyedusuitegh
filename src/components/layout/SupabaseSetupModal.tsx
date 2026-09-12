import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw, KeyRound, ShieldCheck, Download } from 'lucide-react';
import { Modal } from '../common/Modal';
import { getStoredSupabaseConfig, saveSupabaseConfig, testConnection } from '../../lib/supabase';
import { COMPLETE_SUPABASE_SCHEMA_SQL } from '../../lib/schemaSql';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql' | 'instructions'>('sql');
  const [copied, setCopied] = useState(false);

  const projectRef = url ? url.replace('https://', '').split('.')[0] : '';
  const sqlEditorUrl = projectRef 
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new` 
    : 'https://supabase.com/dashboard';

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection(url, anonKey);
      setTestResult(res);
      if (res.success) {
        saveSupabaseConfig(url, anonKey);
        if (onSuccess) onSuccess();
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    handleTest();
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(COMPLETE_SUPABASE_SCHEMA_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadSql = () => {
    const blob = new Blob([COMPLETE_SUPABASE_SCHEMA_SQL], { type: 'text/sql' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'samleyedusuite_ghana_supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Cloud Architecture & Setup"
      subtitle="Connect your Supabase project for real PostgreSQL database, Auth, RLS, Storage & Realtime"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'credentials'
                ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              Project Credentials
            </span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'sql'
                ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              SQL Schema & RLS
            </span>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'instructions'
                ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Architecture Checklist
            </span>
          </button>
        </div>

        {activeTab === 'credentials' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60">
              <p className="text-xs text-orange-800 dark:text-orange-300 font-medium leading-relaxed">
                SamleyEduSuite uses Supabase for 100% of its real infrastructure: PostgreSQL multi-tenant database, Row Level Security (RLS), Supabase Auth, Storage (bucket: <code className="font-mono bg-orange-100 dark:bg-orange-900/50 px-1 py-0.5 rounded">school-assets</code>), and Realtime subscriptions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-ref.supabase.co"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Found in Supabase Dashboard &gt; Project Settings &gt; API
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Anon (Public) Key
              </label>
              <textarea
                rows={2}
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                className="w-full px-3.5 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The public anon key is safe for client-side queries and respects PostgreSQL Row Level Security (RLS).
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                )}
                <div className="leading-relaxed">{testResult.message}</div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                Open Supabase Dashboard <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={isTesting || !url || !anonKey}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  Test Live Connection
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Credentials
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sql' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Run this complete SQL in your Supabase SQL Editor to bootstrap all 18 tables, Ghanaian class seeds, and RLS policies.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .sql
                </button>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors cursor-pointer shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied Full SQL!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Full Schema
                    </>
                  )}
                </button>
                <a
                  href={sqlEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-black dark:hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed rounded-xl max-h-64 overflow-y-auto border border-slate-800">
{COMPLETE_SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              The full schema file is also saved at <code className="text-orange-600 dark:text-orange-400 font-mono">/supabase-schema.sql</code> and <code className="text-orange-600 dark:text-orange-400 font-mono">/src/lib/supabase-schema.sql</code>.
            </p>
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">1. Database Tables & Seed Trigger</h4>
              <p>When an admin registers their Ghanaian private school, the PostgreSQL trigger <code className="font-mono text-orange-600 dark:text-orange-400">handle_new_school_seed()</code> automatically seeds KG 1 through JHS 3 classes and Ghanaian curriculum subjects.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">2. Storage Bucket for Logos & Student Photos</h4>
              <p>In Supabase Dashboard &gt; Storage, ensure a public bucket named <code className="font-mono text-orange-600 dark:text-orange-400">school-assets</code> is created for school crests, student passport pictures, and announcement attachments.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">3. Supabase Realtime Channels</h4>
              <p>The schema automatically adds <code className="font-mono text-orange-600 dark:text-orange-400">attendance, student_class_history, announcements, payments, teacher_reviews, parent_feedback, notifications</code> to the <code className="font-mono">supabase_realtime</code> publication for instant updates across Admin, Teacher, and Parent dashboards.</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
