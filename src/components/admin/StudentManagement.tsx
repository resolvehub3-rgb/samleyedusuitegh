import React, { useEffect, useState, useCallback } from 'react';
import { 
  GraduationCap, 
  PlusCircle, 
  Search, 
  Filter, 
  UserPlus, 
  ArrowRightLeft, 
  FileText, 
  Calendar, 
  Mail, 
  Phone, 
  ShieldCheck,
  Edit2,
  Camera,
  HeartPulse,
  UserCheck,
  Upload,
  X,
  ImageIcon,
  Copy,
  Check,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { getSupabase, adminCreateProfile, findAuthUserByEmail } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Student, SchoolClass, Profile } from '../../types/database';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';

const GHANA_STUDENT_AVATARS = [
  { id: 'boy1', label: 'Primary Boy', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=240&auto=format&fit=crop&q=80' },
  { id: 'girl1', label: 'Primary Girl', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80' },
  { id: 'boy2', label: 'JHS Boy', url: 'https://images.unsplash.com/photo-1485290334039-a3c69043e517?w=240&auto=format&fit=crop&q=80' },
  { id: 'girl2', label: 'JHS Girl', url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=240&auto=format&fit=crop&q=80' }
];

export const StudentManagement: React.FC = () => {
  const { school, schoolSettings } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [parents, setParents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLinkParentModalOpen, setIsLinkParentModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Add Student Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otherNames, setOtherNames] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dob, setDob] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoTab, setPhotoTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [submittingStudent, setSubmittingStudent] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Parent Linking Form State
  const [parentEmail, setParentEmail] = useState('');
  const [parentFullName, setParentFullName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [relationship, setRelationship] = useState<'Father' | 'Mother' | 'Guardian' | 'Other'>('Mother');
  const [submittingParentLink, setSubmittingParentLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  // Parent link success credentials display
  const [parentLinkCredentials, setParentLinkCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
    studentName: string;
    isNew: boolean;
  } | null>(null);
  const [parentCopied, setParentCopied] = useState(false);

  // Class Transfer / Promotion Form State
  const [targetClassId, setTargetClassId] = useState('');
  const [transferReason, setTransferReason] = useState('Academic Term Promotion');
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  const supabase = getSupabase();

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAddError('Student photo file size must be less than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setAddError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      setPhotoUrl(base64Data);

      try {
        if (school) {
          const BUCKET = 'school-assets';

          // Try to create the bucket if it doesn't exist
          try {
            await supabase.storage.createBucket(BUCKET, {
              public: true,
              fileSizeLimit: 5 * 1024 * 1024,
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
            });
          } catch {
            // Bucket may already exist — continue
          }

          const fileExt = file.name.split('.').pop() || 'jpg';
          const filePath = `students/${school.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, file, { upsert: true });

          if (!uploadErr) {
            const { data: { publicUrl } } = supabase.storage
              .from(BUCKET)
              .getPublicUrl(filePath);
            if (publicUrl) {
              setPhotoUrl(publicUrl);
            }
          }
        }
      } catch (storageErr) {
        console.warn('Storage upload fallback to data URL:', storageErr);
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchStudentsData = useCallback(async () => {
    if (!school) return;
    try {
      setLoading(true);
      const [studentsRes, classesRes, parentsRes] = await Promise.all([
        supabase
          .from('students')
          .select('*, current_class:classes(*)')
          .eq('school_id', school.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('classes')
          .select('*')
          .eq('school_id', school.id)
          .order('order_index'),
        supabase
          .from('profiles')
          .select('*')
          .eq('school_id', school.id)
          .eq('role', 'parent')
      ]);

      setStudents((studentsRes.data || []) as Student[]);
      setClasses((classesRes.data || []) as SchoolClass[]);
      setParents((parentsRes.data || []) as Profile[]);

      if (classesRes.data && classesRes.data.length > 0 && !selectedClassId) {
        setSelectedClassId(classesRes.data[0].id);
      }
    } catch (e) {
      console.error('Error fetching students data:', e);
    } finally {
      setLoading(false);
    }
  }, [school, supabase]);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !firstName || !lastName || !selectedClassId) {
      setAddError('First name, last name, and assigned class are required.');
      return;
    }

    setSubmittingStudent(true);
    setAddError(null);

    try {
      // Auto-generate admission number if empty
      const generatedId = admissionNumber || `STD-${Date.now().toString().slice(-5)}`;

      const { data: newStd, error } = await supabase
        .from('students')
        .insert({
          school_id: school.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          other_names: otherNames.trim() || null,
          gender,
          date_of_birth: dob || null,
          admission_number: generatedId,
          current_class_id: selectedClassId,
          guardian_name: emergencyContact.trim() || null,
          photo_url: photoUrl.trim() || null,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        setAddError(error.message);
      } else {
        // Record initial class in student_class_history
        await supabase.from('student_class_history').insert({
          school_id: school.id,
          student_id: newStd.id,
          from_class_id: null,
          to_class_id: selectedClassId,
          academic_year: schoolSettings?.active_academic_year || '2025/2026',
          reason: 'Initial Enrollment'
        });

        setIsAddModalOpen(false);
        setFirstName('');
        setLastName('');
        setOtherNames('');
        setAdmissionNumber('');
        setEmergencyContact('');
        setMedicalNotes('');
        setPhotoUrl('');
        fetchStudentsData();
      }
    } catch (err: any) {
      setAddError(err.message || 'Failed to add student.');
    } finally {
      setSubmittingStudent(false);
    }
  };

  const handleLinkParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !selectedStudent || !parentEmail) return;

    setSubmittingParentLink(true);
    setLinkError(null);

    try {
      // 1. Find or create parent in Supabase Auth + profile
      let parentId: string;
      let isNewParent = false;
      let generatedPassword = '';
      const parentEmailNorm = parentEmail.trim().toLowerCase();

      const { data: existingParent } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', parentEmailNorm)
        .maybeSingle();

      if (existingParent) {
        parentId = existingParent.id;
      } else {
        isNewParent = true;

        // Create Supabase Auth account with a generated password
        generatedPassword = crypto.randomUUID().slice(0, 12) + 'A1!';
        let signUpUserId: string | null = null;

        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: parentEmailNorm,
          password: generatedPassword,
          options: {
            data: {
              full_name: parentFullName.trim() || 'Parent / Guardian',
              role: 'parent',
              phone: parentPhone.trim() || ''
            }
          }
        });

        if (signUpErr && signUpErr.message?.includes('already registered')) {
          // Auth user exists but profile was deleted — find and reactivate
          const { userId, error: findErr } = await findAuthUserByEmail(parentEmailNorm);
          if (userId) {
            signUpUserId = userId;
          } else {
            setLinkError(`This email is already registered but the account could not be recovered. Please use a different email or reset the password from Supabase Dashboard.`);
            setSubmittingParentLink(false);
            return;
          }
        } else if (signUpErr || !signUpData?.user) {
          setLinkError(`Failed to create parent account: ${signUpErr?.message || 'Unknown error'}`);
          setSubmittingParentLink(false);
          return;
        } else {
          signUpUserId = signUpData.user.id;
        }

        parentId = signUpUserId!;

        // Create parent profile using SECURITY DEFINER function (bypasses RLS)
        const { error: createErr } = await adminCreateProfile({
          id: parentId,
          school_id: school.id,
          full_name: parentFullName.trim() || 'Parent / Guardian',
          email: parentEmailNorm,
          phone: parentPhone.trim(),
          role: 'parent'
        });

        if (createErr) {
          setLinkError(`Failed to create parent profile: ${createErr}`);
          setSubmittingParentLink(false);
          return;
        }

        // 5. Mark profile as requiring password reset on first login
        await supabase
          .from('profiles')
          .update({ must_reset_password: true })
          .eq('id', parentId);
      }

      // 2. Insert into parent_students relation
      const { error: relError } = await supabase.from('parent_students').insert({
        parent_id: parentId,
        student_id: selectedStudent.id,
        relationship
      });

      if (relError) {
        if (relError.code === '23505') {
          setLinkError('This parent is already linked to this student.');
        } else {
          setLinkError(relError.message);
        }
      } else {
        // Send notification to parent
        await supabase.from('notifications').insert({
          school_id: school.id,
          user_id: parentId,
          type: 'invitation',
          title: 'Student Profile Linked',
          message: `Your account has been linked to student ${selectedStudent.first_name} ${selectedStudent.last_name} at ${school.name}. Please log in with the credentials provided by the school to access the parent portal.`
        });

        // Show credentials card instead of closing modal
        setParentLinkCredentials({
          name: parentFullName.trim() || 'Parent / Guardian',
          email: parentEmailNorm,
          password: generatedPassword,
          phone: parentPhone.trim(),
          studentName: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
          isNew: isNewParent
        });
        setParentEmail('');
        setParentFullName('');
        setParentPhone('');
        fetchStudentsData();
      }
    } catch (err: any) {
      setLinkError(err.message || 'Failed to link parent.');
    } finally {
      setSubmittingParentLink(false);
    }
  };

  const handleClassTransfer = async () => {
    if (!school || !selectedStudent || !targetClassId) return;
    setSubmittingTransfer(true);
    try {
      const oldClassId = selectedStudent.current_class_id;

      // 1. Update student's current_class_id
      const { error: updateErr } = await supabase
        .from('students')
        .update({ current_class_id: targetClassId })
        .eq('id', selectedStudent.id);

      if (updateErr) throw updateErr;

      // 2. Insert into student_class_history
      await supabase.from('student_class_history').insert({
        school_id: school.id,
        student_id: selectedStudent.id,
        from_class_id: oldClassId,
        to_class_id: targetClassId,
        academic_year: schoolSettings?.active_academic_year || '2025/2026',
        reason: transferReason
      });

      setIsTransferModalOpen(false);
      fetchStudentsData();
    } catch (e: any) {
      alert(`Transfer failed: ${e.message}`);
    } finally {
      setSubmittingTransfer(false);
    }
  };

  const handleCopyParentCredentials = async () => {
    if (!parentLinkCredentials) return;
    const text = [
      `${school?.name || 'School'} - Parent Portal Login`,
      '',
      `Parent: ${parentLinkCredentials.name}`,
      `Student: ${parentLinkCredentials.studentName}`,
      `Relationship: ${relationship}`,
      '',
      `Email: ${parentLinkCredentials.email}`,
      `Password: ${parentLinkCredentials.password}`,
      `Phone: ${parentLinkCredentials.phone || 'N/A'}`,
      '',
      `Portal: ${window.location.origin}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setParentCopied(true);
      setTimeout(() => setParentCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setParentCopied(true);
      setTimeout(() => setParentCopied(false), 2000);
    }
  };

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.first_name} ${s.last_name} ${s.other_names || ''}`.toLowerCase();
    const idMatch = s.student_id_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.admission_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = fullName.includes(searchQuery.toLowerCase());

    const classMatch = filterClass === 'ALL' || s.current_class_id === filterClass;
    const statusMatch = filterStatus === 'ALL' || s.status === filterStatus;

    return (nameMatch || idMatch) && classMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Enrollment & Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Student database, Ghanaian class enrollment, parent linking, and promotions
          </p>
        </div>
        <button
          onClick={() => {
            setAddError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or admission ID..."
            className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="transferred">Transferred</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="Enroll your students into Ghanaian classes (KG 1 to JHS 3). Once enrolled, teachers can record marks and parents can monitor their child's progress."
          actionLabel="Enroll First Student"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID / Adm No.</th>
                  <th className="py-3 px-4">Enrolled Class</th>
                  <th className="py-3 px-4">Gender & DOB</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {std.photo_url ? (
                          <img
                            src={std.photo_url}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center text-xs">
                            {std.first_name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {std.first_name} {std.last_name} {std.other_names ? `(${std.other_names})` : ''}
                          </p>
                          {std.emergency_contact && (
                            <span className="text-[10px] text-slate-400">
                              Emerg: {std.emergency_contact}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {std.student_id_number || std.admission_number || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" size="sm">
                        {std.current_class?.name || 'Unassigned'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <p>{std.gender}</p>
                      {std.date_of_birth && (
                        <p className="text-[10px] text-slate-400">DOB: {std.date_of_birth}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          std.status === 'active'
                            ? 'success'
                            : std.status === 'suspended'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {std.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudent(std);
                            setLinkError(null);
                            setLinkError(null);
                            setLinkSuccess(null);
                            setIsLinkParentModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Link Parent / Guardian"
                        >
                          Link Parent
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(std);
                            setTargetClassId(classes[0]?.id || '');
                            setIsTransferModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Promote or Transfer Class"
                        >
                          Promote
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Student"
        subtitle="Register pupil into standard Ghanaian school curriculum"
        maxWidth="lg"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          {addError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs">
              {addError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Kofi"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last / Family Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Mensah"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Other Names
              </label>
              <input
                type="text"
                value={otherNames}
                onChange={(e) => setOtherNames(e.target.value)}
                placeholder="e.g. Boateng"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign Class *
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
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
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admission / Student ID Number
              </label>
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                placeholder="Leave blank for auto-generation"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="024 123 4567"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Student Passport Photo Enrollment */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                Student Passport Photo (ID Cards & Reports)
              </label>
              <div className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPhotoTab('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    photoTab === 'upload'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoTab('preset')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    photoTab === 'preset'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Quick Avatars
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoTab('url')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    photoTab === 'url'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Photo URL
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Photo Preview Thumbnail */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Student passport preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-1">
                      <Camera className="w-6 h-6 text-slate-400 mx-auto mb-0.5" />
                      <span className="text-[9px] text-slate-400 block font-medium">Passport</span>
                    </div>
                  )}
                </div>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    title="Remove Photo"
                    className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Photo Options by selected tab */}
              <div className="flex-1 w-full text-xs">
                {photoTab === 'upload' && (
                  <div>
                    <label className="flex flex-col items-center justify-center px-4 py-3 border border-dashed border-slate-300 dark:border-slate-600 hover:border-orange-500 rounded-xl cursor-pointer bg-white dark:bg-slate-900 transition-colors">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <Upload className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold text-xs">
                          {uploadingPhoto ? 'Uploading student photo...' : photoUrl ? 'Choose a different photo' : 'Select passport photo from device'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">
                        PNG, JPG or WebP up to 5MB (stored in Supabase school assets)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {photoTab === 'preset' && (
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                      Choose official Ghanaian uniform avatar preset:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {GHANA_STUDENT_AVATARS.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setPhotoUrl(avatar.url)}
                          className={`flex flex-col items-center p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                            photoUrl === avatar.url
                              ? 'border-orange-600 ring-2 ring-orange-500/20 bg-orange-50 dark:bg-orange-950/40'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <img
                            src={avatar.url}
                            alt={avatar.label}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover mb-1 border border-slate-200 dark:border-slate-700"
                          />
                          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                            {avatar.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {photoTab === 'url' && (
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
                      Direct Image or Storage URL:
                    </label>
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://... image link"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Medical Notes / Allergies (Optional)
            </label>
            <input
              type="text"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="e.g. Asthmatic, allergic to peanuts"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingStudent}
              className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {submittingStudent ? 'Enrolling...' : 'Complete Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Link Parent Modal */}
      <Modal
        isOpen={isLinkParentModalOpen}
        onClose={() => {
          setIsLinkParentModalOpen(false);
          setParentLinkCredentials(null);
          setLinkError(null);
        }}
        title={parentLinkCredentials ? 'Parent Account Created' : `Link Parent/Guardian: ${selectedStudent?.first_name} ${selectedStudent?.last_name}`}
        subtitle={parentLinkCredentials ? 'Share these login details with the parent' : "Linked parents receive access to ward's grades, terminal reports, and attendance"}
        maxWidth="md"
      >
        {/* Success Credentials Card */}
        {parentLinkCredentials ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  {parentLinkCredentials.isNew ? 'Account created & linked!' : 'Parent linked successfully!'}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                    {parentLinkCredentials.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{parentLinkCredentials.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Parent of <span className="font-semibold">{parentLinkCredentials.studentName}</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 w-16 shrink-0">Email:</span>
                    <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white select-all">{parentLinkCredentials.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 w-16 shrink-0">Password:</span>
                    <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 select-all">{parentLinkCredentials.password}</span>
                  </div>
                  {parentLinkCredentials.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 w-16 shrink-0">Phone:</span>
                      <span className="text-xs font-mono text-slate-900 dark:text-white">{parentLinkCredentials.phone}</span>
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
              <strong>Important:</strong> Copy and send these login details to the parent via WhatsApp, SMS, or in person. The parent will be required to set a new password on first login.
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCopyParentCredentials}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer transition-colors"
              >
                {parentCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Login Details</>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLinkParentModalOpen(false);
                  setParentLinkCredentials(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleLinkParent} className="space-y-4">
          {linkError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs">
              {linkError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Parent Email Address *
            </label>
            <input
              type="email"
              required
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="parent@gmail.com"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Parent Full Name
              </label>
              <input
                type="text"
                value={parentFullName}
                onChange={(e) => setParentFullName(e.target.value)}
                placeholder="e.g. Mary Mensah"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Parent Phone
              </label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="024 999 8888"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Relationship to Student
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as any)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Guardian">Guardian</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsLinkParentModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingParentLink}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {submittingParentLink ? 'Linking...' : 'Link Parent & Send Notice'}
            </button>
          </div>
        </form>
        )}
      </Modal>

      {/* Promote or Transfer Class Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title={`Promote or Transfer Student: ${selectedStudent?.first_name} ${selectedStudent?.last_name}`}
        subtitle="Update current class and log permanent class transition history"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Class *
            </label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
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
              Reason / Academic Note
            </label>
            <input
              type="text"
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="e.g. Promoted to Basic 4 for 2025/2026 Academic Year"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClassTransfer}
              disabled={submittingTransfer}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {submittingTransfer ? 'Processing...' : 'Confirm Promotion / Transfer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
