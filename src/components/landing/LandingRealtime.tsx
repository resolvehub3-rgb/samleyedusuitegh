import React from 'react';
import {
  Bell,
  ClipboardCheck,
  Megaphone,
  CreditCard,
  ArrowRightLeft,
  Star,
  MessageSquare,
} from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const realtimeFeatures = [
  { icon: ClipboardCheck, label: 'Attendance Updates' },
  { icon: Megaphone, label: 'Announcements' },
  { icon: ArrowRightLeft, label: 'Student Transfers' },
  { icon: Star, label: 'Teacher Reviews' },
  { icon: Bell, label: 'Admin Notifications' },
  { icon: CreditCard, label: 'Payment Updates' },
  { icon: MessageSquare, label: 'Parent Feedback' },
];

export function LandingRealtime() {
  return (
    <SectionWrapper
      id="realtime"
      className="py-20 sm:py-24 bg-gradient-to-br from-orange-500 to-orange-600"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold mb-6">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Powered by Supabase Realtime
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Your School. Connected in Real Time.
          </h2>
          <p className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto">
            Important school activities update instantly across all connected users — no refreshing needed.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {realtimeFeatures.map(({ icon: Icon, label }, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-white text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
