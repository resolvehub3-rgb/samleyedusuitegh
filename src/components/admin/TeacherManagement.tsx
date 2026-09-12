import React, { useEffect, useState, useCallback } from 'react';
import { 
  UserCheck, 
  PlusCircle, 
  Search, 
  Mail, 
  Phone, 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  MoreVertical,
  Award,
  Upload,
  Copy,
  Check
} from 'lucide-react';
import { getSupabase, adminCreateProfile, findAuthUserByEmail } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Profile, SchoolClass, Subject } from '../../types/database';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';

export const TeacherManagement: React.FC = () => {
  const { school, schoolSettings } = useAuth();
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Profile | null>(null);

  // Invite Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [qualification, setQualification] = useState('B.Ed Education');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  // Invitation success credentials display
  const [inviteSuccess, setInviteSuccess] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Profile Image
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Assignment Modal State
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);

  const supabase = getSupabase();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setInviteFeedback('Image file size must be less than 5MB.');
      return;
    }

    setUploadingAvatar(true);
    setInviteFeedback(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      setAvatarUrl(base64Data);

      try {
        if (school) {
          const BUCKET = 'school-assets';

          try {
            await supabase.storage.createBucket(BUCKET, {
              public: true,
              fileSizeLimit: 5 * 1024 * 1024,
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
            });
          } catch {
            // Bucket may already exist
          }

          const fileExt = file.name.split('.').pop() || 'jpg';
          const filePath = `teachers/${school.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, file, { upsert: true });

          if (!uploadErr) {
            const { data: { publicUrl } } = supabase.storage
              .from(BUCKET)
              .getPublicUrl(filePath);
            if (publicUrl) {
              setAvatarUrl(publicUrl);
            }
          }
        }
      } catch (storageErr) {
        console.warn('Storage upload fallback to data URL:', storageErr);
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchData = useCallback(async () => {
    if (!school) return;
    try {
      setLoading(true);
      const [teachersRes, classesRes, subjectsRes, assignmentsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('school_id', school.id).eq('role', 'teacher'),
        supabase.from('classes').select('*').eq('school_id', school.id).order('order_index'),
        supabase.from('subjects').select('*').eq('school_id', school.id).order('name'),
        supabase.from('class_teacher_assignments').select('*, class:classes(*)').eq('school_id', school.id)
      ]);

      setTeachers((teachersRes.data || []) as Profile[]);
      setClasses((classesRes.data || []) as SchoolClass[]);
      setSubjects((subjectsRes.data || []) as Subject[]);
      setAssignments(assignmentsRes.data || []);
    } catch (e) {
      console.error('Error fetching teacher data:', e);
    } finally {
      setLoading(false);
    }
  }, [school, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInviteTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    setSubmittingInvite(true);
    setInviteFeedback(null);

    try {
      // 1. Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        setInviteFeedback('A user profile with this email address already exists.');
        setSubmittingInvite(false);
        return;
      }

      // 2. Create Supabase Auth account with a generated 6-character password
      const emailNorm = email.trim().toLowerCase();
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      let generatedPassword = '';
      for (let i = 0; i < 6; i++) {
        generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      let teacherUserId: string | null = null;

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: emailNorm,
        password: generatedPassword,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'teacher',
            phone: phone.trim()
          }
        }
      });

      if (signUpErr && signUpErr.message?.includes('already registered')) {
        // Auth user exists but profile was deleted — find the existing user and reactivate
        const { userId, error: findErr } = await findAuthUserByEmail(emailNorm);
        if (userId) {
          teacherUserId = userId;
        } else {
          setInviteFeedback(`This email is already registered but the account could not be recovered. Please use a different email or reset the password from Supabase Dashboard.`);
          setSubmittingInvite(false);
          return;
        }
      } else if (signUpErr || !signUpData?.user) {
        setInviteFeedback(`Failed to create teacher account: ${signUpErr?.message || 'Unknown error'}`);
        setSubmittingInvite(false);
        return;
      } else {
        teacherUserId = signUpData.user.id;
      }

      // 3. Create teacher profile using SECURITY DEFINER function (bypasses RLS)
      const { error: profileErr } = await adminCreateProfile({
        id: teacherUserId,
        school_id: school.id,
        full_name: fullName.trim(),
        email: emailNorm,
        phone: phone.trim(),
        role: 'teacher',
        gender,
        qualification,
        avatar_url: avatarUrl || null
      });

      // 4. Mark profile as requiring password reset on first login
      await supabase
        .from('profiles')
        .update({ must_reset_password: true })
        .eq('id', teacherUserId);

      if (profileErr) {
        setInviteFeedback(`Failed to create teacher profile: ${profileErr}`);
      } else {
        // Show login credentials card instead of closing modal
        setInviteSuccess({
          name: fullName.trim(),
          email: emailNorm,
          password: generatedPassword,
          phone: phone.trim()
        });
        setFullName('');
        setEmail('');
        setPhone('');
        setAvatarUrl('');
        fetchData();
      }
    } catch (err: any) {
      setInviteFeedback(err.message || 'Error creating teacher record.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!school || !selectedTeacher || !selectedClassId) return;
    setSavingAssignment(true);
    try {
      // Insert or update assignment
      const { error } = await supabase.from('class_teacher_assignments').upsert({
        school_id: school.id,
        teacher_id: selectedTeacher.id,
        class_id: selectedClassId,
        academic_year: schoolSettings?.active_academic_year || '2025/2026',
        is_class_teacher: isClassTeacher
      }, { onConflict: 'class_id,teacher_id,academic_year' });

      if (error) {
        alert(`Error saving assignment: ${error.message}`);
      } else {
        // If isClassTeacher was selected, update classes table as primary class_teacher_id
        if (isClassTeacher) {
          await supabase
            .from('classes')
            .update({ class_teacher_id: selectedTeacher.id })
            .eq('id', selectedClassId);
        }
        setIsAssignModalOpen(false);
        fetchData();
      }
    } catch (e: any) {
      alert(`Exception: ${e.message}`);
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleToggleActive = async (teacher: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !teacher.is_active })
        .eq('id', teacher.id);

      if (!error) {
        setTeachers((prev) =>
          prev.map((t) => (t.id === teacher.id ? { ...t, is_active: !t.is_active } : t))
        );
      }
    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };

  const handleCopyCredentials = async () => {
    if (!inviteSuccess) return;
    const text = [
      `${school?.name || 'School'} - Teacher Portal Login`,
      '',
      `Name: ${inviteSuccess.name}`,
      `Email: ${inviteSuccess.email}`,
      `Password: ${inviteSuccess.password}`,
      `Phone: ${inviteSuccess.phone || 'N/A'}`,
      '',
      `Portal: ${window.location.origin}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredTeachers = teachers.filter((t) =>
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.phone && t.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Teacher Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Staff directory, classroom assignments, and authorized class teachers
          </p>
        </div>
        <button
          onClick={() => {
            setInviteFeedback(null);
            setIsInviteModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Invite New Teacher
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search teachers by name, email, or phone..."
          className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Teachers Table */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : filteredTeachers.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No teachers added yet"
          description="Build your faculty staff by inviting teachers. They will receive credentials to record attendance, input grades, and generate Ghanaian report cards."
          actionLabel="Invite First Teacher"
          onAction={() => setIsInviteModalOpen(true)}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Teacher</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Qualification</th>
                  <th className="py-3 px-4">Assigned Classes & Subjects</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTeachers.map((teacher) => {
                  const teacherAssignments = assignments.filter((a) => a.teacher_id === teacher.id);
                  const isHeadClassTeacher = teacherAssignments.some((a) => a.is_class_teacher);

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center text-xs">
                            {teacher.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {teacher.full_name}
                              {isHeadClassTeacher && (
                                <span title="Authorized Class Teacher for Report Cards">
                                  <Award className="w-3.5 h-3.5 text-amber-500" />
                                </span>
                              )}
                            </p>
                            <span className="text-[10px] text-slate-400">{teacher.gender || 'Teacher'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {teacher.email}
                          </p>
                          {teacher.phone && (
                            <p className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" /> {teacher.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {teacher.qualification || 'Diploma/Degree'}
                      </td>
                      <td className="py-3 px-4">
                        {teacherAssignments.length === 0 ? (
                          <span className="text-slate-400 text-[11px] italic">Not assigned yet</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {teacherAssignments.map((asg) => (
                              <Badge key={asg.id} variant={asg.is_class_teacher ? 'primary' : 'neutral'} size="sm">
                                {asg.class?.name || 'Class'}
                                {asg.is_class_teacher ? ' (Class Head)' : ''}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={teacher.is_active ? 'success' : 'danger'} size="sm">
                          {teacher.is_active ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setSelectedClassId(classes[0]?.id || '');
                              setSelectedSubjectId('');
                              setIsClassTeacher(false);
                              setIsAssignModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => handleToggleActive(teacher)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                              teacher.is_active
                                ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            {teacher.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Teacher Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteSuccess(null);
          setInviteFeedback(null);
        }}
        title={inviteSuccess ? 'Teacher Account Created' : 'Invite Teacher to Faculty'}
        subtitle={inviteSuccess ? 'Share these login details with the teacher' : 'Staff member will be authorized to enter marks, take attendance, and manage classes'}
        maxWidth="md"
      >
        {/* Success Credentials Card */}
        {inviteSuccess ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  Account ready! Share these details with the teacher.
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center text-sm">
                    {inviteSuccess.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{inviteSuccess.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Teacher Account</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 w-16 shrink-0">Email:</span>
                    <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white select-all">{inviteSuccess.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 w-16 shrink-0">Password:</span>
                    <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 select-all">{inviteSuccess.password}</span>
                  </div>
                  {inviteSuccess.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 w-16 shrink-0">Phone:</span>
                      <span className="text-xs font-mono text-slate-900 dark:text-white">{inviteSuccess.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 w-16 shrink-0">Portal:</span>
                    <span className="text-xs font-mono text-slate-900 dark:text-white">{window.location.origin}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
              <strong>Important:</strong> Copy and send these login details to the teacher via WhatsApp, SMS, or in person. The teacher will be required to set a new password on first login.
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer transition-colors"
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Login Details</>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setInviteSuccess(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleInviteTeacher} className="space-y-4">
          {inviteFeedback && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs">
              {inviteFeedback}
            </div>
          )}

          {/* Profile Image Upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Teacher avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-orange-200 dark:border-orange-800"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-orange-400" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profile Photo (optional)
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors text-slate-700 dark:text-slate-300">
                <Upload className="w-3.5 h-3.5" />
                {uploadingAvatar ? 'Uploading...' : avatarUrl ? 'Change Photo' : 'Choose Photo'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Samuel K. Asante"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.edu.gh"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="024 123 4567"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Qualification
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. B.Ed Mathematics"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingInvite}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {submittingInvite ? 'Inviting Teacher...' : 'Send Invitation'}
            </button>
          </div>
        </form>
        )}
      </Modal>

      {/* Assign Classes & Subjects Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Classes & Subjects: ${selectedTeacher?.full_name || ''}`}
        subtitle="Allocate classroom teaching responsibilities and authorize class teacher report generation"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Class *
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.stage})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject (Optional - leave blank if assigning as general class facilitator)
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="">-- General / Class Teacher --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/50 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isClassTeacher}
                onChange={(e) => setIsClassTeacher(e.target.checked)}
                className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  Appoint as Primary Class Teacher
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Class Teachers have full authority to mark daily roll attendance and generate terminal report cards with remarks for this class.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAssignment}
              disabled={savingAssignment}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {savingAssignment ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
