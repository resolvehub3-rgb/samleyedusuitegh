import React from 'react';
import { GraduationCap, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { usePublicPlatformSettings } from '../../hooks/usePublicPlatformSettings';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const { contact_email } = usePublicPlatformSettings();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">              <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-white transition-colors"
            >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo1.png" alt="SamleyEduSuite" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Samley<span className="text-orange-400">Edu</span>Suite
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Effective Date: September 12, 2026 &nbsp;|&nbsp; Last Updated: September 12, 2026
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Introduction</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              SamleyEduSuite (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy and security of personal information collected through our school management platform. This Privacy Policy describes how we collect, use, store, and share information when you use our services at <span className="font-medium text-slate-800 dark:text-slate-200">samleyedusuite.com</span> and related applications (collectively, the &quot;Platform&quot;).
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
              By using our Platform, you agree to the collection and use of information in accordance with this policy. This policy applies to all users including school administrators, teachers, parents, and students.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Information We Collect</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              We collect the following types of information to provide and improve our services:
            </p>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">2.1 Account &amp; Profile Information</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4">
              <li>Full name, email address, and phone number of school administrators</li>
              <li>School name, location, and institutional details</li>
              <li>Teacher and parent names, email addresses, and contact information</li>
              <li>Student names, dates of birth, class enrollments, and academic records</li>
              <li>Profile photographs uploaded by users</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">2.2 Academic &amp; Administrative Data</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4">
              <li>Attendance records and class schedules</li>
              <li>Academic results, grades, and report cards</li>
              <li>Subject enrollments and class assignments</li>
              <li>Teacher reviews and parent feedback</li>
              <li>Announcements and school communications</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">2.3 Payment Information</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4">
              <li>Subscription plan details and billing history</li>
              <li>Payment transaction records (processed securely through third-party payment providers)</li>
              <li>We do not store credit card numbers or bank account details on our servers</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">2.4 Technical Data</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4">
              <li>IP address, browser type, and device information</li>
              <li>Login timestamps and session activity</li>
              <li>Usage analytics (pages visited, features used) to improve our services</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. How We Use Your Information</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 ml-4">
              <li><span className="font-medium">Service Delivery:</span> To provide school management features including attendance tracking, grade management, report card generation, and parent-teacher communication.</li>
              <li><span className="font-medium">Account Management:</span> To create and manage user accounts, handle authentication, and provide role-based access control.</li>
              <li><span className="font-medium">Communication:</span> To send important service updates, security alerts, and (with consent) promotional communications.</li>
              <li><span className="font-medium">Analytics &amp; Improvement:</span> To analyze usage patterns, identify bugs, and improve the Platform&apos;s functionality and user experience.</li>
              <li><span className="font-medium">Legal Compliance:</span> To comply with applicable laws, regulations, and legal processes in Ghana and other applicable jurisdictions.</li>
              <li><span className="font-medium">Payment Processing:</span> To process subscription payments and maintain billing records.</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. How We Share Your Information</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              We do not sell your personal information. We may share information in the following limited circumstances:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 ml-4">
              <li><span className="font-medium">Within Your School:</span> Data is shared among authorized users within the same school (e.g., administrators, teachers, parents) based on their roles and permissions.</li>
              <li><span className="font-medium">Service Providers:</span> We share data with trusted third-party service providers who assist in operating our Platform (e.g., hosting, payment processing, email delivery), under strict data protection agreements.</li>
              <li><span className="font-medium">Legal Requirements:</span> We may disclose information when required by law, court order, or governmental authority.</li>
              <li><span className="font-medium">Super Admin Access:</span> Platform super administrators may access school data for support, maintenance, and quality assurance purposes only.</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Data Security</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We implement industry-standard security measures to protect your data, including:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4 mt-3">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Role-based access controls and authentication mechanisms</li>
              <li>Regular security assessments and vulnerability scanning</li>
              <li>Automated database backups stored in secure, redundant locations</li>
              <li>Session management and automatic logout for inactive users</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
              While we strive to use commercially acceptable means to protect your data, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Data Retention</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide our services. When a school&apos;s subscription expires or an account is deleted:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4 mt-3">
              <li>Active data is retained for up to 90 days to allow for account recovery or reactivation</li>
              <li>After 90 days, all personal data is permanently deleted from our production databases</li>
              <li>Backup copies are purged within 30 days of the deletion of production data</li>
              <li>Aggregated, anonymized analytics data may be retained indefinitely for service improvement</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Your Rights</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 ml-4">
              <li><span className="font-medium">Access:</span> Request a copy of the personal data we hold about you.</li>
              <li><span className="font-medium">Correction:</span> Request correction of inaccurate or incomplete data.</li>
              <li><span className="font-medium">Deletion:</span> Request deletion of your personal data, subject to legal retention requirements.</li>
              <li><span className="font-medium">Portability:</span> Request your data in a commonly used, machine-readable format.</li>
              <li><span className="font-medium">Objection:</span> Object to the processing of your data for specific purposes.</li>
              <li><span className="font-medium">Withdraw Consent:</span> Withdraw previously given consent at any time.</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
              To exercise any of these rights, please contact us using the information provided below.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Children&apos;s Privacy</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our Platform is used in an educational context and may collect data about students, who are typically minors under Ghanaian law. We collect student data solely for educational and administrative purposes as directed by the school. Schools are responsible for obtaining necessary parental or guardian consent for the collection of student data. We do not use student data for marketing or advertising purposes.
            </p>
          </section>

          {/* Cookies & Tracking */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Cookies &amp; Tracking Technologies</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We use essential cookies to maintain your session and authentication state. We may also use analytics cookies to understand how the Platform is used. You can manage cookie preferences through your browser settings. Disabling essential cookies may affect the functionality of the Platform.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Third-Party Links</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party services you access through our Platform.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">11. International Data Transfers</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Your data may be processed on servers located outside of Ghana. We ensure that any international data transfers comply with applicable data protection laws and that appropriate safeguards are in place to protect your information.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">12. Changes to This Policy</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last Updated&quot; date. Your continued use of the Platform after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">13. Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-sm">{contact_email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-sm">Contact via platform settings</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-sm">Ghana</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SamleyEduSuite. All rights reserved.
          </p>
          <button
            onClick={onBack}
            className="text-xs text-orange-500 hover:text-white transition-colors"
          >
            &larr; Back to Home
          </button>
        </div>
      </footer>
    </div>
  );
}
