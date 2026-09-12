import React, { useEffect, useState } from 'react';
import { Settings, Save, Loader2, Info } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { SkeletonCard } from '../common/SkeletonLoader';

export const SuperAdminSettings: React.FC = () => {
  const { platformSettings, fetchPlatformSettings, updatePlatformSetting, loading } = useSuperAdmin();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { fetchPlatformSettings(); }, [fetchPlatformSettings]);

  useEffect(() => {
    const vals: Record<string, string> = {};
    platformSettings.forEach((s) => { vals[s.setting_key] = s.setting_value || ''; });
    setEditValues(vals);
  }, [platformSettings]);

  const handleSave = async (key: string) => {
    setSaving(key);
    await updatePlatformSetting(key, editValues[key] || '');
    setSaving(null);
  };

  const settingGroups = [
    {
      title: 'Platform Information',
      keys: ['platform_name', 'platform_motto', 'contact_email'],
    },
    {
      title: 'Security & Access',
      keys: ['maintenance_mode', 'allow_school_registration', 'max_schools'],
    },
    {
      title: 'Features',
      keys: ['payment_enabled', 'email_notifications'],
    },
  ];

  if (loading && platformSettings.length === 0) {
    return <div className="space-y-5"><SkeletonCard /><SkeletonCard /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Platform Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure platform-wide settings for SamleyEduSuite</p>
      </div>

      {settingGroups.map((group) => (
        <div key={group.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{group.title}</h3>
          <div className="space-y-4">
            {group.keys.map((key) => {
              const setting = platformSettings.find((s) => s.setting_key === key);
              const value = editValues[key] || '';
              const isBoolean = setting?.setting_type === 'boolean';
              const isSaving = saving === key;

              return (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {setting?.description || key}
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isBoolean ? (
                      <button
                        onClick={() => {
                          const newVal = value === 'true' ? 'false' : 'true';
                          setEditValues(prev => ({ ...prev, [key]: newVal }));
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                          value === 'true' ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          value === 'true' ? 'left-[22px]' : 'left-0.5'
                        }`} />
                      </button>
                    ) : (
                      <input
                        type={setting?.setting_type === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full sm:w-64 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    )}
                    <button
                      onClick={() => handleSave(key)}
                      disabled={isSaving || value === (setting?.setting_value || '')}
                      className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
                      title="Save"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 dark:text-blue-300">
          <p className="font-semibold">Settings are stored in Supabase</p>
          <p className="mt-0.5">All changes are saved to the <code className="bg-blue-100 dark:bg-blue-900/60 px-1 rounded">platform_settings</code> table and are enforced server-side via RLS. Only Super Admins can modify these settings.</p>
        </div>
      </div>
    </div>
  );
};
