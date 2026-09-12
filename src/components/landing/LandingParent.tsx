import React from 'react';
import {
  Eye,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  FileText,
  Megaphone,
  Bell,
  CreditCard,
  Star,
  UserCheck,
} from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const parentFeatures = [
  { icon: Eye, text: 'View their wards and class information' },
  { icon: UserCheck, text: 'View class teacher details' },
  { icon: ClipboardCheck, text: 'View attendance history' },
  { icon: BarChart3, text: 'View academic performance' },
  { icon: FileText, text: 'View terminal reports' },
  { icon: Megaphone, text: 'View school announcements' },
  { icon: Bell, text: 'Receive realtime notifications' },
  { icon: CreditCard, text: 'Make school payments' },
  { icon: Star, text: 'Submit teacher reviews and comments' },
];

export function LandingParent() {
  return (
    <SectionWrapper id="for-parents" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-block text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">
              Parent Portal
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Stay Connected With Your Ward&apos;s Education
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              The Parent Portal gives parents everything they need to stay involved in their
              child&apos;s school experience — from attendance and results to reports and payments.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {parentFeatures.map(({ icon: Icon, text }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-colors"
                >
                  <div className="w-9 h-9 bg-orange-100 dark:bg-orange-500/15 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Card */}
          <div className="hidden lg:block">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl shadow-green-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">Parent Portal</div>
                  <div className="text-sm text-green-100">Connected & Real-time</div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Attendance', value: 'Updated today', color: 'bg-green-400' },
                  { label: 'Reports', value: 'Term 1 available', color: 'bg-white/30' },
                  { label: 'Payments', value: '2 pending', color: 'bg-yellow-400' },
                ].map(({ label, value, color }, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3"
                  >
                    <span className="text-sm font-semibold">{label}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color} text-white`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
