import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, School, SchoolSettings, UserRole } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  school: School | null;
  schoolSettings: SchoolSettings | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerSchool: (
    schoolData: {
      name: string;
      email: string;
      phone: string;
      address: string;
      region: string;
      district: string;
      motto?: string;
      logo_url?: string;
    },
    ownerData: {
      full_name: string;
      email: string;
      password: string;
      phone: string;
      gender?: 'Male' | 'Female' | 'Other';
    }
  ) => Promise<{ success: boolean; error?: string }>;
  createSchoolForCurrentUser: (
    schoolData: {
      name: string;
      email: string;
      phone: string;
      address: string;
      region: string;
      district: string;
      motto?: string;
    },
    ownerData: {
      full_name: string;
      phone: string;
      gender?: 'Male' | 'Female' | 'Other';
    }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSchoolData: () => Promise<void>;
  updateSchoolSettings: (settings: Partial<SchoolSettings>) => Promise<boolean>;
  switchSimulatedRole?: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Flag to prevent onAuthStateChange from overwriting state we just set manually
  const manualStateSetRef = useRef(false);

  const supabase = getSupabase();

  const fetchProfileAndSchool = useCallback(async (userId: string) => {
    // If we just manually set profile/school (e.g. after registerSchool),
    // skip this fetch to avoid clearing state with a stale/failing DB query
    if (manualStateSetRef.current) {
      manualStateSetRef.current = false;
      return;
    }

    try {
      const userRes = await supabase.auth.getUser();
      const currentUser = userRes.data.user;
      const userEmail = currentUser?.email?.toLowerCase().trim() || '';

      // 1. Fetch Profile by ID
      let profileData: any = null;
      const { data: pById, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.error('Error fetching profile by ID:', profileErr);
      } else if (pById) {
        profileData = pById;
      }

      // If not found by ID, attempt lookup by user email
      if (!profileData && userEmail) {
        const { data: pByEmail } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', userEmail)
          .maybeSingle();

        if (pByEmail) {
          // Relink ID to current auth user ID if needed
          if (pByEmail.id !== userId) {
            await supabase.from('profiles').update({ id: userId }).eq('id', pByEmail.id);
          }
          profileData = { ...pByEmail, id: userId };
        }
      }

      // If still no profile, check if there's an existing school created with this owner's email
      if (!profileData && userEmail) {
        const { data: schoolByEmail } = await supabase
          .from('schools')
          .select('*')
          .ilike('email', userEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (schoolByEmail) {
          // Auto-repair admin profile!
          const { data: createdProfile } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              school_id: schoolByEmail.id,
              full_name: (currentUser?.user_metadata?.full_name as string) || 'School Administrator',
              email: userEmail,
              phone: (currentUser?.user_metadata?.phone as string) || schoolByEmail.phone || '',
              role: 'admin',
              gender: 'Male',
              is_active: true
            }, { onConflict: 'id' })
            .select()
            .maybeSingle();

          if (createdProfile) {
            profileData = createdProfile;
          }
        }
      }

      if (profileData) {
        setProfile(profileData as Profile);

        // 2. Fetch School
        if (profileData.school_id) {
          const { data: schoolData, error: schoolErr } = await supabase
            .from('schools')
            .select('*')
            .eq('id', profileData.school_id)
            .maybeSingle();

          if (schoolErr) {
            console.error('Error fetching school:', schoolErr);
          } else if (schoolData) {
            setSchool(schoolData as School);
          }

          // 3. Fetch School Settings
          const { data: settingsData, error: settingsErr } = await supabase
            .from('school_settings')
            .select('*')
            .eq('school_id', profileData.school_id)
            .maybeSingle();

          if (settingsErr) {
            console.error('Error fetching settings:', settingsErr);
          } else if (settingsData) {
            setSchoolSettings(settingsData as SchoolSettings);
          }
        }
      }
      // Don't clear profile/school here if they're already set — only clear on explicit logout
    } catch (err: any) {
      console.error('Error in fetchProfileAndSchool:', err);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Supabase auth session error:', sessionError.message);
        }

        if (session?.user && isMounted) {
          setUser(session.user);
          await fetchProfileAndSchool(session.user.id);
        } else if (isMounted) {
          setUser(null);
          setProfile(null);
          setSchool(null);
          setSchoolSettings(null);
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfileAndSchool(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setSchool(null);
        setSchoolSettings(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, fetchProfileAndSchool]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      setLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInError) {
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfileAndSchool(data.user.id);
        return { success: true };
      }

      return { 
        success: false, 
        error: 'Authentication failed. Please check your Supabase connection and credentials.' 
      };
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during login.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const registerSchool = async (
    schoolData: {
      name: string;
      email: string;
      phone: string;
      address: string;
      region: string;
      district: string;
      motto?: string;
      logo_url?: string;
    },
    ownerData: {
      full_name: string;
      email: string;
      password: string;
      phone: string;
      gender?: 'Male' | 'Female' | 'Other';
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      setLoading(true);

      // 1. Sign up owner in Supabase Auth
      let userObj: User | null = null;
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: ownerData.email.trim(),
        password: ownerData.password,
        options: {
          data: {
            full_name: ownerData.full_name.trim(),
            role: 'admin',
            phone: ownerData.phone.trim()
          }
        }
      });

      if (authErr) {
        // If user already exists in auth, attempt sign-in with provided password to recover
        if (
          authErr.message.toLowerCase().includes('already registered') ||
          authErr.message.toLowerCase().includes('already exists') ||
          (authErr as any).status === 422
        ) {
          const { data: signInRes, error: signInErr } = await supabase.auth.signInWithPassword({
            email: ownerData.email.trim(),
            password: ownerData.password
          });

          if (signInErr || !signInRes?.user) {
            return {
              success: false,
              error: `An account with ${ownerData.email} is already registered. If this is your account, please sign in or verify your password.`
            };
          }
          userObj = signInRes.user;
        } else {
          return { success: false, error: authErr.message };
        }
      } else {
        userObj = authData.user;
        // If session was not immediately returned (e.g. Supabase email confirmation config), establish active session
        if (!authData.session) {
          const { data: signInRes } = await supabase.auth.signInWithPassword({
            email: ownerData.email.trim(),
            password: ownerData.password
          });
          if (signInRes?.user) {
            userObj = signInRes.user;
          }
        }
      }

      const userId = userObj?.id;
      if (!userId) {
        return { success: false, error: 'User registration could not be verified. Please check Supabase project credentials.' };
      }

      // 2. Generate unique slug and insert School record
      const baseSlug = schoolData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'gh-school';
      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

      const { data: newSchool, error: schoolErr } = await supabase
        .from('schools')
        .insert({
          name: schoolData.name.trim(),
          slug,
          email: schoolData.email.trim(),
          phone: schoolData.phone.trim(),
          address: schoolData.address.trim(),
          region: schoolData.region,
          district: schoolData.district.trim(),
          motto: schoolData.motto?.trim() || null,
          logo_url: schoolData.logo_url || null
        })
        .select()
        .single();

      if (schoolErr) {
        return { success: false, error: `Failed to create school: ${schoolErr.message}` };
      }

      // 3. Upsert Admin Profile
      const { data: newProfile, error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          school_id: newSchool.id,
          full_name: ownerData.full_name.trim(),
          email: ownerData.email.trim(),
          phone: ownerData.phone.trim(),
          role: 'admin',
          gender: ownerData.gender || 'Male',
          is_active: true
        }, { onConflict: 'id' })
        .select()
        .single();

      if (profileErr) {
        return { success: false, error: `Failed to create administrator profile: ${profileErr.message}` };
      }

      // 4. Seed Standard Ghanaian Classes & Subjects if trigger did not populate
      const { data: existingClasses } = await supabase
        .from('classes')
        .select('id')
        .eq('school_id', newSchool.id);

      if (!existingClasses || existingClasses.length === 0) {
        const ghanaClasses = [
          { school_id: newSchool.id, name: 'Kindergarten 1', section: 'A', stage: 'Kindergarten', order_index: 1 },
          { school_id: newSchool.id, name: 'Kindergarten 2', section: 'A', stage: 'Kindergarten', order_index: 2 },
          { school_id: newSchool.id, name: 'Basic 1', section: 'A', stage: 'Primary', order_index: 3 },
          { school_id: newSchool.id, name: 'Basic 2', section: 'A', stage: 'Primary', order_index: 4 },
          { school_id: newSchool.id, name: 'Basic 3', section: 'A', stage: 'Primary', order_index: 5 },
          { school_id: newSchool.id, name: 'Basic 4', section: 'A', stage: 'Primary', order_index: 6 },
          { school_id: newSchool.id, name: 'Basic 5', section: 'A', stage: 'Primary', order_index: 7 },
          { school_id: newSchool.id, name: 'Basic 6', section: 'A', stage: 'Primary', order_index: 8 },
          { school_id: newSchool.id, name: 'JHS 1', section: 'A', stage: 'Junior High', order_index: 9 },
          { school_id: newSchool.id, name: 'JHS 2', section: 'A', stage: 'Junior High', order_index: 10 },
          { school_id: newSchool.id, name: 'JHS 3', section: 'A', stage: 'Junior High', order_index: 11 },
        ];
        await supabase.from('classes').insert(ghanaClasses);
      }

      const { data: existingSubjects } = await supabase
        .from('subjects')
        .select('id')
        .eq('school_id', newSchool.id);

      if (!existingSubjects || existingSubjects.length === 0) {
        const ghanaSubjects = [
          { school_id: newSchool.id, name: 'English Language', code: 'ENG', is_core: true },
          { school_id: newSchool.id, name: 'Mathematics', code: 'MATH', is_core: true },
          { school_id: newSchool.id, name: 'Integrated Science', code: 'SCI', is_core: true },
          { school_id: newSchool.id, name: 'Social Studies', code: 'SOC', is_core: true },
          { school_id: newSchool.id, name: 'Information & Communication Technology (ICT)', code: 'ICT', is_core: true },
          { school_id: newSchool.id, name: 'Religious and Moral Education (RME)', code: 'RME', is_core: true },
          { school_id: newSchool.id, name: 'Creative Arts & Design', code: 'CAD', is_core: false },
          { school_id: newSchool.id, name: 'Ghanaian Language & Culture', code: 'GHL', is_core: false },
          { school_id: newSchool.id, name: 'French Language', code: 'FRN', is_core: false },
          { school_id: newSchool.id, name: 'Physical & Health Education (PHE)', code: 'PHE', is_core: false },
        ];
        await supabase.from('subjects').insert(ghanaSubjects);
      }

      // 5. Default Settings
      const { data: newSettings } = await supabase
        .from('school_settings')
        .upsert({
          school_id: newSchool.id,
          active_academic_year: '2025/2026',
          active_term: 'Term 1',
          currency: 'GHS'
        }, { onConflict: 'school_id' })
        .select()
        .maybeSingle();

      // 6. Create 7-Day Trial Subscription
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await supabase
        .from('school_subscriptions')
        .insert({
          school_id: newSchool.id,
          status: 'TRIAL',
          plan_name: 'SamleyEduSuite School Plan',
          amount: 300.00,
          currency: 'GHS',
          trial_started_at: now.toISOString(),
          trial_expires_at: trialEnd.toISOString(),
        });

      // Manually set all state — skip fetchProfileAndSchool to avoid race with onAuthStateChange
      manualStateSetRef.current = true;
      setUser(userObj);
      setSchool(newSchool as School);
      setProfile(newProfile as Profile);
      if (newSettings) setSchoolSettings(newSettings as SchoolSettings);

      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      const msg = err?.message || 'Failed to complete school registration.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const createSchoolForCurrentUser = async (
    schoolData: {
      name: string;
      email: string;
      phone: string;
      address: string;
      region: string;
      district: string;
      motto?: string;
    },
    ownerData: {
      full_name: string;
      phone: string;
      gender?: 'Male' | 'Female' | 'Other';
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      setLoading(true);

      const { data: authRes } = await supabase.auth.getUser();
      const currentUser = authRes?.user || user;
      if (!currentUser) {
        return { success: false, error: 'No active authenticated user. Please sign in.' };
      }

      // 1. Generate unique slug
      const baseSlug = schoolData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'gh-school';
      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

      // 2. Insert School
      const { data: newSchool, error: schoolErr } = await supabase
        .from('schools')
        .insert({
          name: schoolData.name.trim(),
          slug,
          email: schoolData.email.trim(),
          phone: schoolData.phone.trim(),
          address: schoolData.address.trim(),
          region: schoolData.region,
          district: schoolData.district.trim(),
          motto: schoolData.motto?.trim() || null
        })
        .select()
        .single();

      if (schoolErr) {
        return { success: false, error: `Failed to create school: ${schoolErr.message}` };
      }

      // 3. Upsert Admin Profile
      const { data: newProfile, error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          school_id: newSchool.id,
          full_name: ownerData.full_name.trim(),
          email: currentUser.email || schoolData.email.trim(),
          phone: ownerData.phone.trim(),
          role: 'admin',
          gender: ownerData.gender || 'Male',
          is_active: true
        }, { onConflict: 'id' })
        .select()
        .single();

      if (profileErr) {
        return { success: false, error: `Failed to create admin profile: ${profileErr.message}` };
      }

      // 4. Seed Standard Ghanaian Classes if not present
      const { data: existingClasses } = await supabase
        .from('classes')
        .select('id')
        .eq('school_id', newSchool.id);

      if (!existingClasses || existingClasses.length === 0) {
        const ghanaClasses = [
          { school_id: newSchool.id, name: 'Kindergarten 1', section: 'A', stage: 'Kindergarten', order_index: 1 },
          { school_id: newSchool.id, name: 'Kindergarten 2', section: 'A', stage: 'Kindergarten', order_index: 2 },
          { school_id: newSchool.id, name: 'Basic 1', section: 'A', stage: 'Primary', order_index: 3 },
          { school_id: newSchool.id, name: 'Basic 2', section: 'A', stage: 'Primary', order_index: 4 },
          { school_id: newSchool.id, name: 'Basic 3', section: 'A', stage: 'Primary', order_index: 5 },
          { school_id: newSchool.id, name: 'Basic 4', section: 'A', stage: 'Primary', order_index: 6 },
          { school_id: newSchool.id, name: 'Basic 5', section: 'A', stage: 'Primary', order_index: 7 },
          { school_id: newSchool.id, name: 'Basic 6', section: 'A', stage: 'Primary', order_index: 8 },
          { school_id: newSchool.id, name: 'JHS 1', section: 'A', stage: 'Junior High', order_index: 9 },
          { school_id: newSchool.id, name: 'JHS 2', section: 'A', stage: 'Junior High', order_index: 10 },
          { school_id: newSchool.id, name: 'JHS 3', section: 'A', stage: 'Junior High', order_index: 11 },
        ];
        await supabase.from('classes').insert(ghanaClasses);
      }

      // 5. Seed Standard Subjects if not present
      const { data: existingSubjects } = await supabase
        .from('subjects')
        .select('id')
        .eq('school_id', newSchool.id);

      if (!existingSubjects || existingSubjects.length === 0) {
        const ghanaSubjects = [
          { school_id: newSchool.id, name: 'English Language', code: 'ENG', is_core: true },
          { school_id: newSchool.id, name: 'Mathematics', code: 'MATH', is_core: true },
          { school_id: newSchool.id, name: 'Integrated Science', code: 'SCI', is_core: true },
          { school_id: newSchool.id, name: 'Social Studies', code: 'SOC', is_core: true },
          { school_id: newSchool.id, name: 'Information & Communication Technology (ICT)', code: 'ICT', is_core: true },
          { school_id: newSchool.id, name: 'Religious and Moral Education (RME)', code: 'RME', is_core: true },
          { school_id: newSchool.id, name: 'Creative Arts & Design', code: 'CAD', is_core: false },
          { school_id: newSchool.id, name: 'Ghanaian Language & Culture', code: 'GHL', is_core: false },
          { school_id: newSchool.id, name: 'French Language', code: 'FRN', is_core: false },
          { school_id: newSchool.id, name: 'Physical & Health Education (PHE)', code: 'PHE', is_core: false },
        ];
        await supabase.from('subjects').insert(ghanaSubjects);
      }

      // 6. Settings
      const { data: newSettings } = await supabase
        .from('school_settings')
        .upsert({
          school_id: newSchool.id,
          active_academic_year: '2025/2026',
          active_term: 'Term 1',
          currency: 'GHS'
        }, { onConflict: 'school_id' })
        .select()
        .maybeSingle();

      // Manually set all state — skip fetchProfileAndSchool to avoid race with onAuthStateChange
      manualStateSetRef.current = true;
      setUser(currentUser);
      setSchool(newSchool as School);
      setProfile(newProfile as Profile);
      if (newSettings) setSchoolSettings(newSettings as SchoolSettings);

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Failed to initialize school profile.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setUser(null);
      setProfile(null);
      setSchool(null);
      setSchoolSettings(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndSchool(user.id);
    }
  };

  const updateSchoolSettings = async (settingsUpdate: Partial<SchoolSettings>): Promise<boolean> => {
    if (!school) return false;
    try {
      const { data, error: updateErr } = await supabase
        .from('school_settings')
        .upsert({
          school_id: school.id,
          ...settingsUpdate,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (updateErr) {
        console.error('Failed to update settings:', updateErr);
        return false;
      }

      if (data) {
        setSchoolSettings(data as SchoolSettings);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update settings exception:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        school,
        schoolSettings,
        role: profile?.role || null,
        loading,
        error,
        login,
        registerSchool,
        createSchoolForCurrentUser,
        logout,
        refreshProfile,
        refreshSchoolData: refreshProfile,
        updateSchoolSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
