import React from 'react';
import {
  ArrowRight,
  Users,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Bell,
  CreditCard,
} from 'lucide-react';

interface LandingHeroProps {
  onNavigateToRegister: () => void;
}

export function LandingHero({ onNavigateToRegister }: LandingHeroProps) {
  const scrollToFeatures = () => {
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 pb-16 bg-gradient-to-b from-orange-50/80 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 overflow-hidden transition-colors"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100 dark:bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-50 dark:bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Built for Ghanaian Private Schools
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              Smarter School{' '}
              <span className="text-orange-500">Management.</span>
              <br />
              Better Education.
            </h1>

            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              SamleyEduSuite gives Ghanaian private schools one simple platform to manage
              students, teachers, parents, attendance, academic performance, reports,
              communication and payments.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onNavigateToRegister}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all active:scale-[0.98]"
              >
                Register Your School
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500/50 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Explore Features
              </button>
            </div>
          </div>

          {/* Visual Illustration — Dashboard Preview */}
          <div className="hidden lg:block relative">
            {/* Subtle glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-br from-orange-200/40 via-transparent to-blue-200/30 dark:from-orange-500/10 dark:via-transparent dark:to-blue-500/10 rounded-[2rem] blur-2xl pointer-events-none" />

            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-700 overflow-hidden">
              {/* Mock Window Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-700 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-600">
                  <div className="w-4 h-4 bg-orange-500 rounded-md flex items-center justify-center">
                    <BookOpen className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    dashboard.samleyedusuite.com
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-3 h-3 text-orange-500" />
                  </div>
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full" />
                </div>
              </div>

              {/* Dashboard Body */}
              <div className="p-5">
                {/* Greeting */}
                <div className="mb-4">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Good Morning</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Mr. Johnson 👋</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {[
                    { icon: Users, label: 'Students', value: '1,248', trend: '+12%', trendUp: true, bg: 'from-blue-500 to-blue-600', lightBg: 'bg-blue-50 dark:bg-blue-500/10' },
                    { icon: BookOpen, label: 'Teachers', value: '42', trend: '+3', trendUp: true, bg: 'from-emerald-500 to-green-600', lightBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { icon: CreditCard, label: 'Revenue', value: '₵82K', trend: '+18%', trendUp: true, bg: 'from-purple-500 to-purple-600', lightBg: 'bg-purple-50 dark:bg-purple-500/10' },
                  ].map(({ icon: Icon, label, value, trend, trendUp, bg, lightBg }, i) => (
                    <div
                      key={i}
                      className={`${lightBg} rounded-2xl p-3 flex flex-col gap-1.5 transition-transform hover:scale-[1.02]`}
                    >
                      <div className={`w-8 h-8 bg-gradient-to-br ${bg} rounded-xl flex items-center justify-center shadow-sm`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
                        <p className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">{value}</p>
                      </div>
                      <span className={`text-[9px] font-bold ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        {trend} ↑
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mini Chart + Attendance side by side */}
                <div className="grid grid-cols-5 gap-2.5">
                  {/* Mini Bar Chart */}
                  <div className="col-span-2 bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-3">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2">Weekly Activity</p>
                    <div className="flex items-end gap-1 h-14">
                      {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-full rounded-t-sm transition-all ${
                              i === 5
                                ? 'bg-gradient-to-t from-orange-500 to-orange-400'
                                : 'bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-600 dark:to-slate-500'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                          <span className="text-[7px] font-medium text-slate-400 dark:text-slate-500">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Summary */}
                  <div className="col-span-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <ClipboardCheck className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          Today&apos;s Attendance
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/15 px-2 py-0.5 rounded-full">
                        87% Present
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { name: 'A. Mensah', initials: 'AM', status: 'Present', color: 'bg-blue-500' },
                        { name: 'K. Owusu', initials: 'KO', status: 'Present', color: 'bg-emerald-500' },
                        { name: 'E. Boateng', initials: 'EB', status: 'Late', color: 'bg-yellow-500' },
                        { name: 'F. Adjei', initials: 'FA', status: 'Present', color: 'bg-purple-500' },
                      ].map(({ name, initials, status, color }, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1.5"
                        >
                          <div className={`w-5 h-5 ${color} rounded-full flex items-center justify-center`}
                          >
                            <span className="text-[7px] font-bold text-white">{initials}</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 flex-1 truncate">
                            {name}
                          </span>
                          <span
                            className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                              status === 'Present'
                                ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                                : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom status bar */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">System Online</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                    <BarChart3 className="w-3 h-3 text-green-500" />
                    <span className="text-[9px] font-bold text-green-600 dark:text-green-400">
                      Real-time Sync
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating notification badge */}
              <div className="absolute top-14 -right-3 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Bell className="w-3 h-3 text-orange-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-700 dark:text-white">New Alert</p>
                  <p className="text-[8px] text-slate-400 dark:text-slate-500">3 payments pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
