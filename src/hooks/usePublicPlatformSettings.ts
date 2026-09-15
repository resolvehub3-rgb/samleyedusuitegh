import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';

interface PublicSettings {
  platform_name: string;
  platform_motto: string;
  contact_email: string;
}

const DEFAULTS: PublicSettings = {
  platform_name: 'SamleyEduSuite Ghana',
  platform_motto: "Ghana's Premier School Management SaaS",
  contact_email: 'support@samleyedusuite.com',
};

export function usePublicPlatformSettings(): PublicSettings {
  const [settings, setSettings] = useState<PublicSettings>(DEFAULTS);

  useEffect(() => {
    const supabase = getSupabase();
    const keys = Object.keys(DEFAULTS);

    supabase
      .from('platform_settings')
      .select('setting_key, setting_value')
      .in('setting_key', keys)
      .then(({ data, error }) => {
        if (!error && data) {
          const merged = { ...DEFAULTS };
          data.forEach((row: any) => {
            if (row.setting_value && row.setting_key in merged) {
              (merged as any)[row.setting_key] = row.setting_value;
            }
          });
          setSettings(merged);
        }
      })
      .catch(() => {});
  }, []);

  return settings;
}
