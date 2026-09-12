import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from environment or in-memory runtime configuration
let runtimeUrl = '';
let runtimeAnonKey = '';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const url = runtimeUrl || envUrl;
  const anonKey = runtimeAnonKey || envKey;

  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  runtimeUrl = url.trim();
  runtimeAnonKey = anonKey.trim();
  reinitializeSupabase();
}

export function clearSupabaseConfig(): void {
  runtimeUrl = '';
  runtimeAnonKey = '';
  reinitializeSupabase();
}

export function isSupabaseConfigured(): boolean {
  const config = getStoredSupabaseConfig();
  return Boolean(
    config.url && 
    config.anonKey && 
    !config.url.includes('your-project-id') && 
    config.url.startsWith('https://')
  );
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const config = getStoredSupabaseConfig();
  const url = config.url || 'https://placeholder-project.supabase.co';
  const anonKey = config.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  supabaseInstance = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'samleyedusuite_auth_session'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });

  return supabaseInstance;
}

export function reinitializeSupabase(): SupabaseClient {
  supabaseInstance = null;
  return getSupabase();
}

export const supabase = getSupabase();
export const getSupabaseClient = getSupabase;

export async function testConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = (url && anonKey) 
      ? createClient(url, anonKey) 
      : getSupabase();

    const { error } = await testClient.from('schools').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still reachable, but schema needs to be run
      if (error.message?.includes('relation "public.schools" does not exist') || error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connected to Supabase! Note: Please run the SQL schema migration to create the tables.' 
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase' };
  }
}

/**
 * Admin helper: create or update a profile for another user.
 * Uses a SECURITY DEFINER PostgreSQL function to bypass RLS.
 */
/**
 * Find an existing auth user by email (for re-inviting users whose profile was deleted).
 */
export async function findAuthUserByEmail(email: string): Promise<{ userId?: string; error?: string }> {
  const client = getSupabase();
  const { data, error } = await client.rpc('find_auth_user_by_email', { p_email: email });
  if (error) return { error: error.message };
  if (data && data.length > 0) return { userId: data[0].user_id };
  return {};
}

export async function adminCreateProfile(opts: {
  id: string;
  school_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  gender?: string;
  qualification?: string | null;
  is_active?: boolean;
  avatar_url?: string | null;
}): Promise<{ error?: string }> {
  const client = getSupabase();

  // 1. Try the SECURITY DEFINER RPC function first
  const { error: rpcError } = await client.rpc('admin_create_profile', {
    p_id: opts.id,
    p_school_id: opts.school_id,
    p_full_name: opts.full_name,
    p_email: opts.email,
    p_phone: opts.phone || null,
    p_role: opts.role,
    p_gender: opts.gender || 'Male',
    p_qualification: opts.qualification || null,
    p_is_active: opts.is_active ?? true,
    p_avatar_url: opts.avatar_url || null
  });

  if (!rpcError) return {};

  // 2. If the function doesn't exist, fall back to a direct upsert
  const fnMissing =
    rpcError.message?.includes('Could not find the function') ||
    rpcError.message?.includes('function') && rpcError.message?.includes('does not exist') ||
    rpcError.code === '42883'; // undefined_function

  if (fnMissing) {
    console.warn('admin_create_profile RPC not found – falling back to direct upsert.');
    const { error: upsertError } = await client.from('profiles').upsert({
      id: opts.id,
      school_id: opts.school_id,
      full_name: opts.full_name,
      email: opts.email,
      phone: opts.phone || null,
      role: opts.role,
      gender: opts.gender || 'Male',
      qualification: opts.qualification || null,
      is_active: opts.is_active ?? true,
      avatar_url: opts.avatar_url || null,
    }, { onConflict: 'id' });

    if (upsertError) {
      return {
        error: `Profile save failed (RLS blocked the insert). Run the SQL schema in your Supabase SQL Editor to create the admin_create_profile function. Error: ${upsertError.message}`,
      };
    }
    return {};
  }

  return { error: rpcError.message };
}
