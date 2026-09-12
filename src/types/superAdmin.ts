// =============================================================================
// Super Admin TypeScript Types
// =============================================================================

export type SchoolStatus = 'active' | 'suspended' | 'pending' | 'deactivated';

export type PlatformSettingType = 'string' | 'boolean' | 'number' | 'json';

export type AuditAction =
  | 'school_registered'
  | 'school_activated'
  | 'school_suspended'
  | 'school_reactivated'
  | 'school_deactivated'
  | 'user_account_changed'
  | 'payment_status_changed'
  | 'announcement_published'
  | 'platform_setting_changed'
  | 'super_admin_login'
  | 'super_admin_profile_updated'
  | 'platform_announcement_created'
  | 'file_deleted';

export type AnnouncementTarget = 'all' | 'school_admins' | 'teachers' | 'parents';

export type PlatformNotificationType =
  | 'new_school_registration'
  | 'school_status_change'
  | 'payment_event'
  | 'platform_activity'
  | 'system_report'
  | 'account_event'
  | 'announcement';

// Extended School type with status for super admin
export interface SuperAdminSchool {
  id: string;
  name: string;
  slug?: string | null;
  motto?: string | null;
  logo_url?: string | null;
  address?: string | null;
  region?: string | null;
  district?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  status: SchoolStatus;
  created_at: string;
  updated_at: string;
  student_count?: number;
  teacher_count?: number;
  parent_count?: number;
}

// Platform Settings
export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: PlatformSettingType;
  description?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  actor_role?: string | null;
  school_id?: string | null;
  school_name?: string | null;
  action: string;
  entity?: string | null;
  entity_id?: string | null;
  description?: string | null;
  metadata?: Record<string, any> | null;
  ip_address?: string | null;
  created_at: string;
}

// Platform Announcement
export interface PlatformAnnouncement {
  id: string;
  author_id: string;
  title: string;
  content: string;
  target: AnnouncementTarget;
  is_published: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
    email: string;
  };
}

// Platform Notification
export interface PlatformNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_entity?: string | null;
  related_entity_id?: string | null;
  is_read: boolean;
  created_at: string;
}

// Contact Message (from landing page form)
export interface ContactMessage {
  id: string;
  full_name: string;
  school_name: string;
  email: string;
  phone?: string | null;
  message: string;
  is_read: boolean;
  read_at?: string | null;
  read_by?: string | null;
  created_at: string;
}

// Dashboard Statistics
export interface SuperAdminDashboardStats {
  totalSchools: number;
  activeSchools: number;
  suspendedSchools: number;
  pendingSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalSchoolAdmins: number;
  totalPayments: number;
  totalPaymentAmount: number;
  pendingPayments: number;
  recentRegistrations: number;
}

// Super Admin Profile (extends regular Profile)
export interface SuperAdminProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: 'super_admin';
  avatar_url?: string | null;
  gender?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Storage Item
export interface StorageItem {
  name: string;
  id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  last_accessed_at?: string;
}

export interface StorageBucket {
  id: string;
  name: string;
  owner?: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
}
