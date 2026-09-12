import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  Terminal, 
  Layers, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { getSupabaseClient, getStoredSupabaseConfig } from '../../lib/supabase';
import { COMPLETE_SUPABASE_SCHEMA_SQL } from '../../lib/schemaSql';

interface SupabaseDatabaseHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SupabaseDatabaseHelperModal: React.FC<SupabaseDatabaseHelperModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tablesStatus, setTablesStatus] = useState<{
    schools: boolean;
    profiles: boolean;
    classes: boolean;
    subjects: boolean;
    students: boolean;
    attendance: boolean;
    payments: boolean;
    terminal_reports: boolean;
  }>({
    schools: false,
    profiles: false,
    classes: false,
    subjects: false,
    students: false,
    attendance: false,
    payments: false,
    terminal_reports: false
  });
  const [allReady, setAllReady] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);

  const config = getStoredSupabaseConfig();
  // Extract project ref from URL if possible (e.g., https://oswxgbvfgwrqlhbmntdi.supabase.co -> oswxgbvfgwrqlhbmntdi)
  const projectRef = config.url ? config.url.replace('https://', '').split('.')[0] : '';
  const sqlEditorUrl = projectRef 
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new` 
    : 'https://supabase.com/dashboard';

  const checkTables = async () => {
    setIsVerifying(true);
    const client = getSupabaseClient();
    const results: any = { ...tablesStatus };

    const checkTable = async (tableName: string) => {
      try {
        const { error } = await client.from(tableName).select('id').limit(1);
        if (!error || (error && error.code !== 'PGRST205')) {
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };

    const [schools, profiles, classes, subjects, students, attendance, payments, terminal_reports] = await Promise.all([
      checkTable('schools'),
      checkTable('profiles'),
      checkTable('classes'),
      checkTable('subjects'),
      checkTable('students'),
      checkTable('attendance'),
      checkTable('payments'),
      checkTable('terminal_reports')
    ]);

    const updated = {
      schools,
      profiles,
      classes,
      subjects,
      students,
      attendance,
      payments,
      terminal_reports
    };

    setTablesStatus(updated);
    const ready = schools && profiles;
    setAllReady(ready);
    setCheckedOnce(true);
    setIsVerifying(false);

    if (ready && onSuccess) {
      onSuccess();
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkTables();
    }
  }, [isOpen]);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(COMPLETE_SUPABASE_SCHEMA_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadSql = () => {
    const blob = new Blob([COMPLETE_SUPABASE_SCHEMA_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'samleyedusuite_ghana_supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Supabase Database Tables"
      subtitle="Push all 18 PostgreSQL tables, Row Level Security (RLS), and Ghanaian curriculum auto-seed triggers"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Status Banner */}
        {allReady ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Database Tables are Live & Ready!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                All required tables and security policies exist in your Supabase project. You can now register your school or log into your portal.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Action Needed: Execute SQL in Supabase
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Your Supabase project (<code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">{projectRef || 'connected'}</code>) does not have the database tables yet. Follow the 3 simple steps below to create all 18 tables in under 30 seconds.
              </p>
            </div>
          </div>
        )}

        {/* 3 Steps Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs mb-2">
                1
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                Copy Migration SQL
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Contains complete tables, RLS policies, KG1-JHS3 curriculum seeds & Realtime publications.
              </p>
            </div>

            <div className="pt-3 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleCopySql}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied (464 Lines)!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full SQL</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadSql}
                className="w-full py-1.5 px-3 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" /> Download .sql
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs mb-2">
                2
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                Open Supabase SQL Editor
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Direct link to your Supabase project's SQL editor dashboard in a new tab.
              </p>
            </div>

            <div className="pt-3">
              <a
                href={sqlEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs mb-2">
                3
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                Paste & Click "RUN"
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Paste into the Supabase editor and press Run. Then verify the tables below!
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={checkTables}
                disabled={isVerifying}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Verifying...' : 'Verify Tables Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Table Detection Checklist */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-orange-600" />
              Live Table Verification Status
            </h5>
            <button
              onClick={checkTables}
              disabled={isVerifying}
              className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
              Re-check
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { key: 'schools', label: 'schools (Tenants)' },
              { key: 'profiles', label: 'profiles (Auth)' },
              { key: 'classes', label: 'classes (KG-JHS)' },
              { key: 'subjects', label: 'subjects (GES)' },
              { key: 'students', label: 'students' },
              { key: 'attendance', label: 'attendance' },
              { key: 'payments', label: 'payments (GHS)' },
              { key: 'terminal_reports', label: 'terminal_reports' }
            ].map(({ key, label }) => {
              const isPresent = (tablesStatus as any)[key];
              return (
                <div
                  key={key}
                  className={`p-2 rounded-xl flex items-center gap-2 border ${
                    isPresent
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isPresent ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                  <span className="font-mono text-[11px] truncate">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Target Supabase: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{projectRef}.supabase.co</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            {allReady && (
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Continue to Registration / Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
