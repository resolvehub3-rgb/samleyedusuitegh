import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import {
  SuperAdminSchool,
  SchoolStatus,
  PlatformSetting,
  AuditLog,
  PlatformAnnouncement,
  PlatformNotification,
  ContactMessage,
  SuperAdminDashboardStats,
} from '../types/superAdmin';

interface SuperAdminContextType {
  user: User | null;
  isSuperAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  // Dashboard
  stats: SuperAdminDashboardStats;
  recentActivity: AuditLog[];
  // Auth
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  // Profile
  updateProfile: (data: { full_name?: string; phone?: string; avatar_url?: string }) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  // Schools
  schools: SuperAdminSchool[];
  fetchSchools: () => Promise<void>;
  updateSchoolStatus: (schoolId: string, status: string) => Promise<boolean>;
  // Users
  schoolAdmins: any[];
  fetchSchoolAdmins: () => Promise<void>;
  // Teachers
  teachers: any[];
  fetchTeachers: () => Promise<void>;
  // Parents
  parents: any[];
  fetchParents: () => Promise<void>;
  // Students
  students: any[];
  fetchStudents: () => Promise<void>;
  // Payments
  payments: any[];
  fetchPayments: () => Promise<void>;
  paymentStats: { total: number; amount: number; pending: number; verified: number };
  // Announcements
  announcements: PlatformAnnouncement[];
  fetchAnnouncements: () => Promise<void>;
  createAnnouncement: (data: { title: string; content: string; target: string }) => Promise<boolean>;
  deleteAnnouncement: (id: string) => Promise<boolean>;
  toggleAnnouncementPublish: (id: string, published: boolean) => Promise<boolean>;
  // Notifications
  platformNotifications: PlatformNotification[];
  platformUnreadCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  // Audit
  auditLogs: AuditLog[];
  fetchAuditLogs: () => Promise<void>;
  logAuditEvent: (action: string, entity?: string, entityId?: string, description?: string, schoolId?: string, schoolName?: string, metadata?: any) => Promise<void>;
  // Contact Messages
  contactMessages: ContactMessage[];
  fetchContactMessages: () => Promise<void>;
  markContactMessageRead: (id: string) => Promise<void>;
  markAllContactMessagesRead: () => Promise<void>;
  deleteContactMessage: (id: string) => Promise<boolean>;
  unreadContactMessages: number;
  // Settings
  platformSettings: PlatformSetting[];
  fetchPlatformSettings: () => Promise<void>;
  updatePlatformSetting: (key: string, value: string) => Promise<boolean>;
  // Storage
  storageBuckets: any[];
  fetchStorageBuckets: () => Promise<void>;
  // Global search
  globalSearch: (query: string) => Promise<any>;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

const defaultStats: SuperAdminDashboardStats = {
  totalSchools: 0,
  activeSchools: 0,
  suspendedSchools: 0,
  pendingSchools: 0,
  totalStudents: 0,
  totalTeachers: 0,
  totalParents: 0,
  totalSchoolAdmins: 0,
  totalPayments: 0,
  totalPaymentAmount: 0,
  pendingPayments: 0,
  recentRegistrations: 0,
};

export const SuperAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Dashboard
  const [stats, setStats] = useState<SuperAdminDashboardStats>(defaultStats);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);

  // Schools
  const [schools, setSchools] = useState<SuperAdminSchool[]>([]);

  // Users
  const [schoolAdmins, setSchoolAdmins] = useState<any[]>([]);

  // Teachers
  const [teachers, setTeachers] = useState<any[]>([]);

  // Parents
  const [parents, setParents] = useState<any[]>([]);

  // Students
  const [students, setStudents] = useState<any[]>([]);

  // Payments
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState({ total: 0, amount: 0, pending: 0, verified: 0 });

  // Announcements
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);

  // Notifications
  const [platformNotifications, setPlatformNotifications] = useState<PlatformNotification[]>([]);
  const [platformUnreadCount, setPlatformUnreadCount] = useState(0);

  // Audit
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Contact Messages
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [unreadContactMessages, setUnreadContactMessages] = useState(0);

  // Settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSetting[]>([]);

  // Storage
  const [storageBuckets, setStorageBuckets] = useState<any[]>([]);

  const supabase = getSupabase();
  const mountedRef = useRef(true);

  // Check if current user is super admin
  const checkSuperAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return false;
      return data.role === 'super_admin';
    } catch {
      return false;
    }
  }, [supabase]);

  // Initialize auth
  useEffect(() => {
    let isMounted = true;
    mountedRef.current = true;

    async function init() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          setUser(session.user);
          const isAdmin = await checkSuperAdminRole(session.user.id);
          if (isMounted) {
            setIsSuperAdmin(isAdmin);
          }
        }
      } catch (err) {
        console.error('Super admin auth init error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        const isAdmin = await checkSuperAdminRole(session.user.id);
        if (isMounted) setIsSuperAdmin(isAdmin);
      } else {
        setUser(null);
        setIsSuperAdmin(false);
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      mountedRef.current = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, checkSuperAdminRole]);

  // Fetch dashboard stats via SECURITY DEFINER function (bypasses RLS)
  const fetchDashboardStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_super_admin_stats');
      if (error) {
        console.error('Stats RPC error:', error);
        // Fallback to direct queries if RPC fails
        const [schoolsRes, studentsRes, teachersRes, parentsRes, adminsRes, paymentsRes] = await Promise.all([
          supabase.from('schools').select('id', { count: 'exact', head: true }),
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'parent'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
          supabase.from('payments').select('amount', { count: 'exact' }),
        ]);
        const totalPaymentAmount = (paymentsRes.data || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
        if (mountedRef.current) {
          setStats({
            totalSchools: schoolsRes.count || 0, activeSchools: 0, suspendedSchools: 0, pendingSchools: 0,
            totalStudents: studentsRes.count || 0, totalTeachers: teachersRes.count || 0,
            totalParents: parentsRes.count || 0, totalSchoolAdmins: adminsRes.count || 0,
            totalPayments: paymentsRes.count || 0, totalPaymentAmount, pendingPayments: 0, recentRegistrations: 0,
          });
        }
        return;
      }

      const s = data as any;
      if (mountedRef.current) {
        setStats({
          totalSchools: s.totalSchools || 0,
          activeSchools: s.activeSchools || 0,
          suspendedSchools: s.suspendedSchools || 0,
          pendingSchools: s.pendingSchools || 0,
          totalStudents: s.totalStudents || 0,
          totalTeachers: s.totalTeachers || 0,
          totalParents: s.totalParents || 0,
          totalSchoolAdmins: s.totalSchoolAdmins || 0,
          totalPayments: s.totalPayments || 0,
          totalPaymentAmount: Number(s.totalPaymentAmount) || 0,
          pendingPayments: s.pendingPayments || 0,
          recentRegistrations: 0,
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }, [supabase]);

  // Fetch recent activity
  const fetchRecentActivity = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data && mountedRef.current) {
        setRecentActivity(data as AuditLog[]);
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    }
  }, [supabase]);

  // =========================================================================
  // AUTH
  // =========================================================================

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInError) {
        return { success: false, error: signInError.message };
      }

      if (data.user) {
        setUser(data.user);
        const isAdmin = await checkSuperAdminRole(data.user.id);
        setIsSuperAdmin(isAdmin);

        if (!isAdmin) {
          await supabase.auth.signOut();
          return { success: false, error: 'Access denied. You are not a Super Administrator.' };
        }

        // Update user metadata so AuthContext can detect super_admin role
        await supabase.auth.updateUser({
          data: { role: 'super_admin' }
        });

        // Log the login event
        await logAuditEvent(
          data.user.id, data.user.email || email, 'super_admin',
          undefined, undefined, 'super_admin_login', 'user', data.user.id,
          `Super admin logged in: ${data.user.email}`
        );

        return { success: true };
      }

      return { success: false, error: 'Authentication failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unexpected error during login.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Super admin sign out error:', e);
    } finally {
      setUser(null);
      setIsSuperAdmin(false);
      setStats(defaultStats);
      setSchools([]);
      setAuditLogs([]);
      setAnnouncements([]);
      setPlatformNotifications([]);
      setPlatformSettings([]);
    }
  };

  // =========================================================================
  // PROFILE
  // =========================================================================

  const updateProfile = async (data: { full_name?: string; phone?: string; avatar_url?: string }): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (!error) {
        await logAuditEvent(
          user.id, user.email || '', 'super_admin',
          undefined, undefined, 'super_admin_profile_updated', 'profile', user.id,
          'Super admin updated their profile'
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to change password.' };
    }
  };

  // =========================================================================
  // SCHOOLS
  // =========================================================================

  // Compute display status based on school status and subscription status
  const computeDisplayStatus = (schoolStatus: string | null, subscription: any): SchoolStatus => {
    // If school is manually suspended/deactivated by super admin, that takes priority
    if (schoolStatus === 'suspended') return 'suspended';
    if (schoolStatus === 'deactivated') return 'deactivated';
    if (schoolStatus === 'pending') return 'pending';

    // If no subscription info, fall back to school status
    if (!subscription) return (schoolStatus as SchoolStatus) || 'active';

    const subStatus = subscription.status;

    // Subscription-based status mapping
    if (subStatus === 'SUSPENDED' || subStatus === 'EXPIRED' || subStatus === 'REJECTED') {
      return 'deactivated';
    }

    // Check if trial has expired
    if (subStatus === 'TRIAL' && subscription.trial_expires_at) {
      if (new Date(subscription.trial_expires_at).getTime() < Date.now()) {
        return 'deactivated';
      }
    }

    // Check if paid subscription has expired
    if (subStatus === 'ACTIVE' && subscription.subscription_expires_at) {
      if (new Date(subscription.subscription_expires_at).getTime() < Date.now()) {
        return 'deactivated';
      }
    }

    // Otherwise, use the school's own status (default active)
    return (schoolStatus as SchoolStatus) || 'active';
  };

  const fetchSchools = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Get counts and subscription info for each school
        const schoolsWithCounts = await Promise.all(
          data.map(async (school: any) => {
            const [studentsRes, teachersRes, parentsRes, subRes] = await Promise.all([
              supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
              supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', school.id).eq('role', 'teacher'),
              supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', school.id).eq('role', 'parent'),
              supabase.from('school_subscriptions').select('status, trial_expires_at, subscription_expires_at').eq('school_id', school.id).maybeSingle(),
            ]);

            const subscription = subRes.data;
            const schoolStatus = school.status || 'active';

            return {
              ...school,
              status: schoolStatus,
              student_count: studentsRes.count || 0,
              teacher_count: teachersRes.count || 0,
              parent_count: parentsRes.count || 0,
              subscription_status: subscription?.status || null,
              trial_expires_at: subscription?.trial_expires_at || null,
              subscription_expires_at: subscription?.subscription_expires_at || null,
              display_status: computeDisplayStatus(schoolStatus, subscription),
            };
          })
        );
        setSchools(schoolsWithCounts as SuperAdminSchool[]);
      }
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  }, [supabase]);

  const updateSchoolStatus = async (schoolId: string, status: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const school = schools.find(s => s.id === schoolId);
      const { error } = await supabase
        .from('schools')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', schoolId);

      if (!error) {
        const actionMap: Record<string, string> = {
          active: 'school_activated',
          suspended: 'school_suspended',
          pending: 'school_registered',
          deactivated: 'school_deactivated',
        };

        await logAuditEvent(
          user.id, user.email || '', 'super_admin',
          schoolId, school?.name || '', actionMap[status] || 'user_account_changed',
          'school', schoolId,
          `School "${school?.name}" status changed to ${status}`
        );

        // Create notification for the school admins
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('school_id', schoolId)
          .eq('role', 'admin');

        if (admins && admins.length > 0) {
          for (const admin of admins) {
            await supabase.from('notifications').insert({
              school_id: schoolId,
              user_id: admin.id,
              type: 'announcement',
              title: `School Status Changed`,
              message: `Your school status has been updated to ${status.toUpperCase()} by the platform administrator.`,
              is_read: false,
            });
          }
        }

        await fetchSchools();
        await fetchDashboardStats();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // =========================================================================
  // USERS (SCHOOL ADMINS)
  // =========================================================================

  const fetchSchoolAdmins = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, school:schools(name, status)')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSchoolAdmins(data);
      }
    } catch (err) {
      console.error('Error fetching school admins:', err);
    }
  }, [supabase]);

  // =========================================================================
  // TEACHERS
  // =========================================================================

  const fetchTeachers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, school:schools(name, status)')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTeachers(data);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  }, [supabase]);

  // =========================================================================
  // PARENTS
  // =========================================================================

  const fetchParents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, school:schools(name, status)')
        .eq('role', 'parent')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setParents(data);
      }
    } catch (err) {
      console.error('Error fetching parents:', err);
    }
  }, [supabase]);

  // =========================================================================
  // STUDENTS
  // =========================================================================

  const fetchStudents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*, school:schools(name, status), current_class:classes(name, stage)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  }, [supabase]);

  // =========================================================================
  // PAYMENTS
  // =========================================================================

  const fetchPayments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, school:schools(name), student:students(first_name, last_name, admission_number), parent:profiles!parent_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(200);

      if (!error && data) {
        setPayments(data);
        const total = data.length;
        const amount = data.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
        const pending = data.filter((p: any) => p.status === 'pending').length;
        const verified = data.filter((p: any) => p.status === 'verified' || p.status === 'paid').length;
        setPaymentStats({ total, amount, pending, verified });
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  }, [supabase]);

  // =========================================================================
  // ANNOUNCEMENTS
  // =========================================================================

  const fetchAnnouncements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('platform_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching announcements:', error);
        return;
      }
      if (data) {
        setAnnouncements(data as PlatformAnnouncement[]);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  }, [supabase]);

  const createAnnouncement = async (data: { title: string; content: string; target: string }): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('platform_announcements').insert({
        author_id: user.id,
        title: data.title,
        content: data.content,
        target: data.target,
        is_published: true,
        published_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to create announcement:', error);
        return false;
      }

      // Fire-and-forget: log audit
      (async () => {
        try {
          await logAuditEvent(
            user.id, user.email || '', 'super_admin',
            undefined, undefined, 'announcement_published',
            'platform_announcement', undefined,
            `Platform announcement published: "${data.title}"`
          );
        } catch {}
      })();

      await fetchAnnouncements();
      return true;
    } catch (err) {
      console.error('Error creating announcement:', err);
      return false;
    }
  };

  const deleteAnnouncement = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('platform_announcements').delete().eq('id', id);
      if (!error) {
        await fetchAnnouncements();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const toggleAnnouncementPublish = async (id: string, published: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('platform_announcements')
        .update({
          is_published: published,
          published_at: published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (!error) {
        await fetchAnnouncements();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================

  const fetchPlatformNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('platform_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setPlatformNotifications(data as PlatformNotification[]);
        setPlatformUnreadCount(data.filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Error fetching platform notifications:', err);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (isSuperAdmin && user) {
      fetchPlatformNotifications();
    }
  }, [isSuperAdmin, user, fetchPlatformNotifications]);

  const markNotificationRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('platform_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (!error) {
        setPlatformNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setPlatformUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('platform_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setPlatformNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setPlatformUnreadCount(0);
      }
    } catch {}
  };

  // =========================================================================
  // AUDIT LOGS
  // =========================================================================

  const fetchAuditLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (!error && data) {
        setAuditLogs(data as AuditLog[]);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  }, [supabase]);

  const logAuditEvent = async (
    actorId?: string, actorEmail?: string, actorRole?: string,
    schoolId?: string, schoolName?: string,
    action?: string, entity?: string, entityId?: string,
    description?: string, metadata?: any
  ) => {
    try {
      await supabase.rpc('log_audit_event', {
        p_actor_id: actorId || null,
        p_actor_email: actorEmail || null,
        p_actor_role: actorRole || null,
        p_school_id: schoolId || null,
        p_school_name: schoolName || null,
        p_action: action || null,
        p_entity: entity || null,
        p_entity_id: entityId || null,
        p_description: description || null,
        p_metadata: metadata ? JSON.stringify(metadata) : null,
      });
    } catch (err) {
      console.error('Error logging audit event:', err);
    }
  };

  // =========================================================================
  // PLATFORM SETTINGS
  // =========================================================================

  const fetchPlatformSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('setting_key');

      if (!error && data) {
        setPlatformSettings(data as PlatformSetting[]);
      }
    } catch (err) {
      console.error('Error fetching platform settings:', err);
    }
  }, [supabase]);

  const updatePlatformSetting = async (key: string, value: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          setting_value: value,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', key);

      if (!error) {
        await logAuditEvent(
          user.id, user.email || '', 'super_admin',
          undefined, undefined, 'platform_setting_changed',
          'platform_setting', undefined,
          `Platform setting "${key}" updated to "${value}"`
        );
        await fetchPlatformSettings();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // =========================================================================
  // STORAGE
  // =========================================================================

  const fetchStorageBuckets = useCallback(async () => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (!error && buckets) {
        setStorageBuckets(buckets);
      }
    } catch (err) {
      console.error('Error fetching storage buckets:', err);
    }
  }, [supabase]);

  // =========================================================================
  // CONTACT MESSAGES
  // =========================================================================

  const fetchContactMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        // Table might not exist yet — user needs to run the SQL schema
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('contact_messages table not found. Please run the superAdminSchema.sql in your Supabase SQL Editor.');
        } else {
          console.error('Error fetching contact messages:', error);
        }
        return;
      }

      if (data) {
        setContactMessages(data as ContactMessage[]);
        setUnreadContactMessages(data.filter((m: any) => !m.is_read).length);
      }
    } catch (err) {
      console.error('Error fetching contact messages:', err);
    }
  }, [supabase]);

  const markContactMessageRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          read_by: user?.id || null,
        })
        .eq('id', id);

      if (!error) {
        setContactMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        setUnreadContactMessages(prev => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const markAllContactMessagesRead = async () => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          read_by: user?.id || null,
        })
        .eq('is_read', false);

      if (!error) {
        setContactMessages(prev => prev.map(m => ({ ...m, is_read: true })));
        setUnreadContactMessages(0);
      }
    } catch {}
  };

  const deleteContactMessage = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (!error) {
        setContactMessages(prev => prev.filter(m => m.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Fetch all dashboard data
  const fetchAllDashboardData = useCallback(async () => {
    await Promise.all([fetchDashboardStats(), fetchRecentActivity(), fetchContactMessages()]);
  }, [fetchDashboardStats, fetchRecentActivity, fetchContactMessages]);

  // Load dashboard data when super admin is confirmed
  useEffect(() => {
    if (isSuperAdmin && user) {
      fetchAllDashboardData();

      // Realtime subscriptions for dashboard updates
      const channel = supabase
        .channel('super_admin_dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' }, () => {
          fetchDashboardStats();
          fetchSchools();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
          fetchDashboardStats();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          fetchDashboardStats();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
          fetchDashboardStats();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'school_subscriptions' }, () => {
          fetchSchools();
          fetchDashboardStats();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
          fetchRecentActivity();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
          fetchContactMessages();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_notifications' }, (payload) => {
          if (payload.eventType === 'INSERT' && user) {
            const notif = payload.new as PlatformNotification;
            if (notif.user_id === user.id) {
              setPlatformNotifications(prev => [notif, ...prev]);
              setPlatformUnreadCount(prev => prev + 1);
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSuperAdmin, user, supabase, fetchAllDashboardData, fetchDashboardStats, fetchSchools, fetchRecentActivity, fetchContactMessages]);

  // =========================================================================
  // GLOBAL SEARCH
  // =========================================================================

  const globalSearch = async (query: string) => {
    if (!query || query.length < 2) return { schools: [], teachers: [], parents: [], students: [], payments: [] };

    try {
      const [schoolsRes, teachersRes, parentsRes, studentsRes, paymentsRes] = await Promise.all([
        supabase.from('schools').select('*').ilike('name', `%${query}%`).limit(10),
        supabase.from('profiles').select('*, school:schools(name)').eq('role', 'teacher').ilike('full_name', `%${query}%`).limit(10),
        supabase.from('profiles').select('*, school:schools(name)').eq('role', 'parent').ilike('full_name', `%${query}%`).limit(10),
        supabase.from('students').select('*, school:schools(name)').or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,admission_number.ilike.%${query}%`).limit(10),
        supabase.from('payments').select('*, school:schools(name)').ilike('invoice_number', `%${query}%`).limit(10),
      ]);

      return {
        schools: schoolsRes.data || [],
        teachers: teachersRes.data || [],
        parents: parentsRes.data || [],
        students: studentsRes.data || [],
        payments: paymentsRes.data || [],
      };
    } catch (err) {
      console.error('Global search error:', err);
      return { schools: [], teachers: [], parents: [], students: [], payments: [] };
    }
  };

  // =========================================================================
  // CONTEXT VALUE
  // =========================================================================

  return (
    <SuperAdminContext.Provider
      value={{
        user,
        isSuperAdmin,
        loading,
        initialized,
        stats,
        recentActivity,
        login,
        logout,
        updateProfile,
        changePassword,
        schools,
        fetchSchools,
        updateSchoolStatus,
        schoolAdmins,
        fetchSchoolAdmins,
        teachers,
        fetchTeachers,
        parents,
        fetchParents,
        students,
        fetchStudents,
        payments,
        fetchPayments,
        paymentStats,
        announcements,
        fetchAnnouncements,
        createAnnouncement,
        deleteAnnouncement,
        toggleAnnouncementPublish,
        platformNotifications,
        platformUnreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        auditLogs,
        fetchAuditLogs,
        logAuditEvent,
        platformSettings,
        fetchPlatformSettings,
        updatePlatformSetting,
        storageBuckets,
        fetchStorageBuckets,
        globalSearch,
        contactMessages,
        fetchContactMessages,
        markContactMessageRead,
        markAllContactMessagesRead,
        deleteContactMessage,
        unreadContactMessages,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
};

export const useSuperAdmin = (): SuperAdminContextType => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};
