import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  CheckCircle2, 
  UploadCloud, 
  Phone, 
  Mail, 
  Globe, 
  CreditCard, 
  Calendar, 
  Percent,
  MapPin
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { GHANA_REGIONS } from '../../types/database';

export const SchoolSettingsView: React.FC = () => {
  const { school, schoolSettings, refreshSchoolData } = useAuth();
  
  // School General Info
  const [name, setName] = useState(school?.name || '');
  const [motto, setMotto] = useState(school?.motto || '');
  const [region, setRegion] = useState(school?.region || 'Greater Accra');
  const [district, setDistrict] = useState(school?.district || 'Accra Metropolitan');
  const [address, setAddress] = useState(school?.address || '');
  const [phone, setPhone] = useState(school?.phone || '');
  const [email, setEmail] = useState(school?.email || '');
  const [website, setWebsite] = useState(school?.website || '');
  const [logoUrl, setLogoUrl] = useState(school?.logo_url || '');

  // Academic Settings
  const [academicYear, setAcademicYear] = useState(schoolSettings?.active_academic_year || '2025/2026');
  const [term, setTerm] = useState(schoolSettings?.active_term || 'Term 1');
  const [classWeight, setClassWeight] = useState(schoolSettings?.class_score_weight || 30);
  const [examWeight, setExamWeight] = useState(schoolSettings?.exam_score_weight || 70);

  // Payment Settings
  const [momoNumber, setMomoNumber] = useState(schoolSettings?.momo_number || '');
  const [momoMerchantName, setMomoMerchantName] = useState(schoolSettings?.momo_merchant_name || '');
  const [bankName, setBankName] = useState(schoolSettings?.bank_name || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(schoolSettings?.bank_account_number || '');
  const [bankBranch, setBankBranch] = useState(schoolSettings?.bank_branch || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const supabase = getSupabase();

  useEffect(() => {
    if (school) {
      setName(school.name || '');
      setMotto(school.motto || '');
      setRegion(school.region || 'Greater Accra');
      setDistrict(school.district || 'Accra Metropolitan');
      setAddress(school.address || '');
      setPhone(school.phone || '');
      setEmail(school.email || '');
      setWebsite(school.website || '');
      setLogoUrl(school.logo_url || '');
    }
    if (schoolSettings) {
      setAcademicYear(schoolSettings.active_academic_year || '2025/2026');
      setTerm(schoolSettings.active_term || 'Term 1');
      setClassWeight(schoolSettings.class_score_weight || 30);
      setExamWeight(schoolSettings.exam_score_weight || 70);
      setMomoNumber(schoolSettings.momo_number || '');
      setMomoMerchantName(schoolSettings.momo_merchant_name || '');
      setBankName(schoolSettings.bank_name || '');
      setBankAccountNumber(schoolSettings.bank_account_number || '');
      setBankBranch(schoolSettings.bank_branch || '');
    }
  }, [school, schoolSettings]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !school) return;

    setUploadingLogo(true);
    try {
      // Convert file to base64 data URL as universal fallback
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${school.id}/crest_${Date.now()}.${fileExt}`;
      const BUCKET = 'school-assets';

      // Try to create the bucket if it doesn't exist
      try {
        const { error: bucketErr } = await supabase.storage.createBucket(BUCKET, {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });
        // Ignore 'already exists' errors
        if (bucketErr && !bucketErr.message?.includes('already exists')) {
          console.warn('Bucket creation note:', bucketErr.message);
        }
      } catch {
        // Bucket may already exist or service unavailable — continue
      }

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { upsert: true });

      if (error) {
        // Storage unavailable — use the base64 data URL as fallback
        console.warn('Storage upload fallback to data URL:', error.message);
        setLogoUrl(dataUrl);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(fileName);
        setLogoUrl(publicUrlData.publicUrl);
      }
    } catch (err: any) {
      console.error('Upload error:', err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      // 1. Update School Info
      const { error: schoolError } = await supabase
        .from('schools')
        .update({
          name: name.trim(),
          motto: motto.trim(),
          region,
          district: district.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          website: website.trim(),
          logo_url: logoUrl.trim() || null
        })
        .eq('id', school.id);

      if (schoolError) throw schoolError;

      // 2. Update School Settings
      const { error: settingsError } = await supabase
        .from('school_settings')
        .upsert({
          school_id: school.id,
          active_academic_year: academicYear.trim(),
          active_term: term,
          class_score_weight: Number(classWeight),
          exam_score_weight: Number(examWeight),
          momo_number: momoNumber.trim() || null,
          momo_merchant_name: momoMerchantName.trim() || null,
          bank_name: bankName.trim() || null,
          bank_account_number: bankAccountNumber.trim() || null,
          bank_branch: bankBranch.trim() || null
        }, { onConflict: 'school_id' });

      if (settingsError) throw settingsError;

      await refreshSchoolData();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            School Configuration & Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tenant metadata, Ghanaian academic term calendar, grading policy, and fee channels
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Settings Updated!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* School Crest / Logo Section */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          School Crest / Emblem
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          This logo will appear on all official terminal report cards, fee receipts, and navigation headers.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="School crest"
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="w-8 h-8 text-slate-400" />
            )}
          </div>

          <div className="space-y-3 flex-1 w-full">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Upload Crest Image (PNG / JPEG)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingLogo}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Or Direct Image URL
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/crest.png"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* General Information */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          General School Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official School Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              School Motto
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="e.g. Knowledge is Light"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white italic"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Region (Ghana) *
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            >
              {GHANA_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r} Region
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              District / Municipal
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Tema West Municipal"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Postal Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. P.O. Box 1234, Spintex Road, Accra"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Telephone Contact
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 24 000 0000"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Website (Optional)
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://myschool.edu.gh"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Academic Term & Grading Policy */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Academic Term & Continuous Assessment Grading Weights
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Active Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2025/2026"
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Active Term
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
            >
              <option value="Term 1">Term 1 (First Term)</option>
              <option value="Term 2">Term 2 (Second Term)</option>
              <option value="Term 3">Term 3 (Third Term)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Class Score Weight (%)
            </label>
            <input
              type="number"
              min={10}
              max={50}
              value={classWeight}
              onChange={(e) => {
                const val = Number(e.target.value);
                setClassWeight(val);
                setExamWeight(100 - val);
              }}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Exam Score Weight (%)
            </label>
            <input
              type="number"
              readOnly
              value={examWeight}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Fee Payment Channels (MoMo & Bank Details) */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Fee Collection Channels (Mobile Money & Bank Account)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Displayed to parents when paying fees in their parent portal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              School MoMo Pay / Merchant Number
            </label>
            <input
              type="text"
              value={momoNumber}
              onChange={(e) => setMomoNumber(e.target.value)}
              placeholder="e.g. 0244123456 or Merchant ID: 893120"
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              MoMo Registered Merchant Name
            </label>
            <input
              type="text"
              value={momoMerchantName}
              onChange={(e) => setMomoMerchantName(e.target.value)}
              placeholder="e.g. KNOWLEDGE HILL ACADEMY LTD"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. GCB Bank, Ecobank Ghana, Fidelity"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bank Account Number
            </label>
            <input
              type="text"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="e.g. 1021130002934"
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bank Branch
            </label>
            <input
              type="text"
              value={bankBranch}
              onChange={(e) => setBankBranch(e.target.value)}
              placeholder="e.g. High Street Branch, Accra"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
