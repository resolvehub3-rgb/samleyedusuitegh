import React from 'react';
import { GraduationCap, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Effective Date: September 12, 2026 &nbsp;|&nbsp; Last Updated: September 12, 2026
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Acceptance */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              By accessing or using SamleyEduSuite (the &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you must not access or use the Platform. These Terms constitute a legally binding agreement between you (&quot;you,&quot; &quot;your,&quot; or &quot;User&quot;) and SamleyEduSuite (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Eligibility</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The Platform is designed for use by educational institutions, school administrators, teachers, parents, and students. By registering an account, you represent that:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4 mt-3">
              <li>You are at least 18 years of age, or you are using the Platform on behalf of a school with appropriate authorization</li>
              <li>You have the legal authority to enter into these Terms on behalf of yourself or the institution you represent</li>
              <li>All information you provide during registration is accurate and complete</li>
              <li>You will maintain and promptly update your account information to keep it accurate</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Account Registration &amp; Security</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              To use the Platform, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Ensuring that your account credentials are not shared with unauthorized individuals</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
              School administrators are responsible for managing user accounts within their institution, including granting and revoking access for teachers, parents, and other staff members.
            </p>
          </section>

          {/* User Roles */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. User Roles &amp; Responsibilities</h2>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">4.1 School Administrators</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4">
              <li>Manage the school&apos;s account, subscription, and billing</li>
              <li>Create and manage teacher, student, and parent accounts</li>
              <li>Configure school settings, classes, and subjects</li>
              <li>Ensure compliance with applicable data protection laws</li>
              <li>Obtain necessary consent from parents/guardians for student data collection</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">4.2 Teachers</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4">
              <li>Use the Platform solely for educational and administrative purposes</li>
              <li>Maintain accurate attendance records and academic grades</li>
              <li>Protect student data and only access information relevant to their classes</li>
              <li>Communicate with parents through the Platform in a professional manner</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">4.3 Parents</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4">
              <li>Monitor their children&apos;s academic progress and attendance</li>
              <li>Communicate with teachers and school administrators through the Platform</li>
              <li>Keep their contact information up to date</li>
              <li>Use the Platform respectfully and in accordance with these Terms</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">4.4 Students</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed ml-4">
              Students may access the Platform through accounts created by their school administrators or parents. Students must use the Platform responsibly and in accordance with their school&apos;s policies.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Acceptable Use Policy</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              You agree not to use the Platform to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit harmful, threatening, abusive, or harassing content</li>
              <li>Impersonate any person or entity</li>
              <li>Attempt to gain unauthorized access to other users&apos; accounts or our systems</li>
              <li>Interfere with or disrupt the Platform or its infrastructure</li>
              <li>Use automated tools (bots, scrapers) to access the Platform without our written permission</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Platform</li>
              <li>Use the Platform for any commercial purpose not related to your educational institution</li>
              <li>Upload malicious code, viruses, or any harmful software</li>
              <li>Collect or harvest personal information of other users without their consent</li>
            </ul>
          </section>

          {/* Subscriptions & Payments */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Subscriptions &amp; Payments</h2>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">6.1 Subscription Plans</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The Platform operates on a subscription-based model. Different subscription tiers are available with varying features and limits. Current pricing and plan details are available on our pricing page.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">6.2 Payment Terms</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4">
              <li>All payments are processed in Ghanaian Cedis (GHS) or as otherwise indicated</li>
              <li>Subscriptions are billed according to the selected plan (monthly or annually)</li>
              <li>Payment must be received before access to premium features is granted</li>
              <li>All fees are non-refundable unless otherwise stated in our refund policy</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">6.3 Free Trial</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We may offer free trial periods for new users. At the end of the trial, your account will be restricted unless you subscribe to a paid plan. We will notify you before your trial expires.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">6.4 Price Changes</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We reserve the right to modify our pricing at any time. We will provide at least 30 days&apos; notice of any price increases. Existing subscribers will be honored at their current rate until the next billing cycle after the notice period.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Intellectual Property</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              The Platform, including all software, design, text, graphics, logos, and documentation, is the exclusive property of SamleyEduSuite and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-medium">Your Content:</span> You retain ownership of all data, documents, and content you upload to the Platform (&quot;Your Content&quot;). By using the Platform, you grant us a limited license to process, store, and display Your Content solely for the purpose of providing the services to you. This license terminates when you delete your content or your account.
            </p>
          </section>

          {/* Data Ownership */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Data Ownership &amp; Export</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              You retain full ownership of all data you enter into the Platform. School administrators may request a complete export of their school&apos;s data at any time during their subscription. Upon account cancellation or termination, we will provide a reasonable period (up to 30 days) to export your data before permanent deletion. See our Privacy Policy for detailed data retention information.
            </p>
          </section>

          {/* Availability & Uptime */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Service Availability</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We strive to provide reliable and continuous access to the Platform. However, we do not guarantee uninterrupted availability. The Platform may be temporarily unavailable due to scheduled maintenance, updates, or circumstances beyond our reasonable control. We will make reasonable efforts to provide advance notice of planned maintenance.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Limitation of Liability</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              To the maximum extent permitted by applicable law:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 ml-4 mt-3">
              <li>The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied</li>
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Our total liability to you shall not exceed the amount paid by you for the Platform in the 12 months preceding the claim</li>
              <li>We are not responsible for data loss, educational outcomes, or decisions made based on Platform information</li>
            </ul>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">11. Indemnification</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              You agree to indemnify and hold harmless SamleyEduSuite, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or related to your use of the Platform, your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">12. Termination</h2>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">12.1 By You</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              School administrators may cancel their subscription at any time through the platform settings. Cancellation takes effect at the end of the current billing period. You may also request account deletion by contacting our support team.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">12.2 By Us</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We may suspend or terminate your access to the Platform if you violate these Terms, fail to pay subscription fees, or engage in activity that poses a security risk. We will provide reasonable notice before termination unless immediate action is required.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">12.3 Effect of Termination</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Upon termination, your right to access the Platform ceases immediately. We will retain your data for the period described in our Privacy Policy before permanent deletion.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">13. Dispute Resolution</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Any disputes arising from these Terms shall first be attempted to be resolved through good-faith negotiation. If a resolution cannot be reached within 30 days, the dispute shall be submitted to the competent courts of Ghana. These Terms shall be governed by and construed in accordance with the laws of Ghana.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">14. Changes to These Terms</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the &quot;Last Updated&quot; date. For significant changes, we will also send a notification through the Platform or via email. Your continued use of the Platform after the changes take effect constitutes your acceptance of the revised Terms.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">15. Severability</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its original intent.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">16. Entire Agreement</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and SamleyEduSuite regarding the use of the Platform and supersede any prior agreements or understandings.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">17. Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-sm">support@samleyedusuite.com</span>
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
