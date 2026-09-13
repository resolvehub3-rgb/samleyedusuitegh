export type UserRole = 'admin' | 'teacher' | 'parent' | 'super_admin';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type StudentStatus = 'active' | 'transferred' | 'graduated' | 'withdrawn';

export type TermType = 'Term 1' | 'Term 2' | 'Term 3';

export type AudienceType = 'all' | 'parents' | 'teachers' | 'class';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'verified';

export type PaymentMethod = 
  | 'MTN Mobile Money' 
  | 'Telecel Cash' 
  | 'AT Money' 
  | 'Bank Transfer' 
  | 'Cash at Accounts';

export type FeedbackCategory = 'academic' | 'attendance' | 'teacher_feedback' | 'general_issue' | 'billing';

export type FeedbackStatus = 'open' | 'reviewed' | 'resolved';

export type NotificationType = 
  | 'announcement' 
  | 'transfer' 
  | 'attendance' 
  | 'review' 
  | 'feedback' 
  | 'payment' 
  | 'assignment' 
  | 'report_card';

export interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  district: string;
  logo_url?: string | null;
  motto?: string | null;
  website?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolSettings {
  id: string;
  school_id: string;
  active_academic_year: string;
  active_term: TermType;
  currency: string;
  class_score_weight?: number;
  exam_score_weight?: number;
  momo_number?: string | null;
  momo_merchant_name?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_branch?: string | null;
  grading_scale?: GradingScaleItem[];
  updated_at: string;
}

export interface GradingScaleItem {
  grade: string;
  min_score: number;
  max_score: number;
  remark: string;
  gpa_equivalent?: number;
}

export interface Profile {
  id: string;
  school_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar_url?: string | null;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string | null;
  qualification?: string | null;
  employment_status?: 'Full-time' | 'Part-time' | 'Contract';
  is_active: boolean;
  must_reset_password?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassItem {
  id: string;
  school_id: string;
  name: string; // e.g., 'KG 1', 'Basic 4', 'JHS 2'
  section: string; // 'A', 'B'
  stage: 'Kindergarten' | 'Primary' | 'Junior High';
  order_index: number;
  created_at: string;
  class_teacher?: Profile | null;
  student_count?: number;
}

export interface SubjectItem {
  id: string;
  school_id: string;
  name: string;
  code: string;
  is_core: boolean;
  created_at: string;
}

export interface ClassSubject {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  teacher_id?: string | null;
  class?: ClassItem;
  subject?: SubjectItem;
  teacher?: Profile;
}

export interface ClassTeacherAssignment {
  id: string;
  school_id: string;
  class_id: string;
  teacher_id: string;
  academic_year: string;
  is_authorized_reports: boolean;
  assigned_at: string;
  class?: ClassItem;
  teacher?: Profile;
}

export interface Student {
  id: string;
  school_id: string;
  student_id_number: string;
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female';
  photo_url?: string | null;
  address?: string | null;
  status: StudentStatus;
  current_class_id: string;
  academic_year: string;
  created_at: string;
  updated_at: string;
  current_class?: ClassItem;
  parents?: Profile[];
}

export interface ParentStudent {
  id: string;
  school_id: string;
  parent_id: string;
  student_id: string;
  relationship: 'Father' | 'Mother' | 'Guardian' | 'Other';
  is_primary: boolean;
  created_at: string;
  parent?: Profile;
  student?: Student;
}

export interface StudentClassHistory {
  id: string;
  school_id: string;
  student_id: string;
  previous_class_id: string;
  new_class_id: string;
  academic_year: string;
  term: TermType;
  reason?: string | null;
  changed_by: string;
  created_at: string;
  student?: Student;
  previous_class?: ClassItem;
  new_class?: ClassItem;
  changer?: Profile;
}

export interface Attendance {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string | null;
  recorded_by: string;
  created_at: string;
  student?: Student;
  recorder?: Profile;
}

export interface StudentResult {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  academic_year: string;
  term: TermType;
  class_score: number; // 0-30 or 0-50
  exam_score: number;  // 0-70 or 0-50
  total_score: number; // 0-100
  grade: string;       // 1-9 or A1-F9
  remark: string;
  position?: number | null;
  recorded_by: string;
  updated_at: string;
  student?: Student;
  subject?: SubjectItem;
}

export interface TerminalReport {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  academic_year: string;
  term: TermType;
  attendance_total: number;
  attendance_present: number;
  class_teacher_remarks: string;
  head_teacher_remarks?: string | null;
  promotion_status?: string | null;
  conduct?: string | null;
  interest?: string | null;
  attitude?: string | null;
  generated_by: string;
  generated_at: string;
  updated_at: string;
  student?: Student;
  class?: ClassItem;
  generator?: Profile;
  results?: StudentResult[];
}

export interface Announcement {
  id: string;
  school_id: string;
  title: string;
  message: string;
  audience: AudienceType;
  target_class_id?: string | null;
  attachment_url?: string | null;
  created_by: string;
  expiry_date?: string | null;
  created_at: string;
  author?: Profile;
  target_class?: ClassItem;
}

export interface Payment {
  id: string;
  school_id: string;
  parent_id: string;
  student_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  purpose: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  transaction_reference?: string | null;
  notes?: string | null;
  paid_at?: string | null;
  verified_by?: string | null;
  created_at: string;
  parent?: Profile;
  student?: Student;
  verifier?: Profile;
}

export interface TeacherReview {
  id: string;
  school_id: string;
  teacher_id: string;
  parent_id: string;
  student_id: string;
  rating: number; // 1 to 5
  comment: string;
  term: TermType;
  academic_year: string;
  created_at: string;
  teacher?: Profile;
  parent?: Profile;
  student?: Student;
}

export interface ParentFeedback {
  id: string;
  school_id: string;
  parent_id: string;
  student_id?: string | null;
  subject: string;
  category: FeedbackCategory;
  message: string;
  status: FeedbackStatus;
  admin_response?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  parent?: Profile;
  student?: Student;
}

export interface NotificationItem {
  id: string;
  school_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_record_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export const GHANAIAN_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Oti',
  'Savannah',
  'North East',
  'Western North'
] as const;

export const GHANA_REGIONS = GHANAIAN_REGIONS;

export type SchoolClass = ClassItem;
export type Subject = SubjectItem;
export type PaymentRecord = Payment;
export type AttendanceRecord = Attendance;

export const DEFAULT_GHANA_GRADING: GradingScaleItem[] = [
  { grade: '1', min_score: 80, max_score: 100, remark: 'Excellent / Distinction', gpa_equivalent: 4.0 },
  { grade: '2', min_score: 70, max_score: 79, remark: 'Very Good', gpa_equivalent: 3.5 },
  { grade: '3', min_score: 65, max_score: 69, remark: 'Good', gpa_equivalent: 3.0 },
  { grade: '4', min_score: 60, max_score: 64, remark: 'Credit', gpa_equivalent: 2.5 },
  { grade: '5', min_score: 55, max_score: 59, remark: 'Credit', gpa_equivalent: 2.0 },
  { grade: '6', min_score: 50, max_score: 54, remark: 'Pass', gpa_equivalent: 1.5 },
  { grade: '7', min_score: 45, max_score: 49, remark: 'Weak', gpa_equivalent: 1.0 },
  { grade: '8', min_score: 40, max_score: 44, remark: 'Very Weak', gpa_equivalent: 0.5 },
  { grade: '9', min_score: 0, max_score: 39, remark: 'Fail', gpa_equivalent: 0.0 }
];

export function calculateGrade(score: number, gradingScale = DEFAULT_GHANA_GRADING): { grade: string; remark: string } {
  const matched = gradingScale.find(g => score >= g.min_score && score <= g.max_score);
  if (matched) {
    return { grade: matched.grade, remark: matched.remark };
  }
  if (score >= 80) return { grade: '1', remark: 'Excellent' };
  if (score >= 70) return { grade: '2', remark: 'Very Good' };
  if (score >= 60) return { grade: '4', remark: 'Credit' };
  if (score >= 50) return { grade: '6', remark: 'Pass' };
  return { grade: '9', remark: 'Fail' };
}
