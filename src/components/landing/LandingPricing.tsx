import React, { useState } from 'react';
import {
  CheckCircle2, ArrowRight, CreditCard, Shield, Clock, Upload, Check, ChevronDown, Sparkles
} from 'lucide-react';
import { useFaq } from '../../context/FaqContext';

interface LandingPricingProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

function SubscriptionFaqItem({ question, answer, index }: { key?: string; question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`group border rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? 'border-orange-200 dark:border-orange-800/40 bg-white dark:bg-slate-800/60 shadow-lg shadow-orange-500/5'
          : 'border-slate-100 dark:border-slate-700/40 bg-white dark:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-600/60 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-none'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-5 sm:p-6 text-left transition-colors"
        aria-expanded={isOpen}
      >
        <div
          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300 ${
            isOpen
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/30 group-hover:text-orange-500'
          }`}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
        <span
          className={`flex-1 font-semibold text-sm sm:text-base transition-colors duration-200 ${
            isOpen
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
          }`}
        >
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-all duration-300 ${
            isOpen
              ? 'rotate-180 text-orange-500'
              : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 ml-12">
          <div className="h-px bg-gradient-to-r from-orange-200 via-orange-100 to-transparent dark:from-orange-800/30 dark:via-orange-900/20 mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

const stepStyles = [
  {
    gradient: 'from-orange-500 to-amber-500',
    iconShadow: 'shadow-orange-500/30',
    chip: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200/60 dark:border-orange-800/40',
    arrow: 'text-orange-400',
    hoverShadow: 'hover:shadow-orange-500/15',
    hoverRing: 'hover:ring-orange-200 dark:hover:ring-orange-500/30',
  },
  {
    gradient: 'from-amber-500 to-yellow-500',
    iconShadow: 'shadow-amber-500/30',
    chip: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40',
    arrow: 'text-amber-400',
    hoverShadow: 'hover:shadow-amber-500/15',
    hoverRing: 'hover:ring-amber-200 dark:hover:ring-amber-500/30',
  },
  {
    gradient: 'from-violet-500 to-purple-600',
    iconShadow: 'shadow-violet-500/30',
    chip: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200/60 dark:border-violet-800/40',
    arrow: 'text-violet-400',
    hoverShadow: 'hover:shadow-violet-500/15',
    hoverRing: 'hover:ring-violet-200 dark:hover:ring-violet-500/30',
  },
  {
    gradient: 'from-sky-500 to-blue-600',
    iconShadow: 'shadow-sky-500/30',
    chip: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/40',
    arrow: 'text-sky-400',
    hoverShadow: 'hover:shadow-sky-500/15',
    hoverRing: 'hover:ring-sky-200 dark:hover:ring-sky-500/30',
  },
  {
    gradient: 'from-emerald-500 to-teal-600',
    iconShadow: 'shadow-emerald-500/30',
    chip: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    arrow: 'text-emerald-400',
    hoverShadow: 'hover:shadow-emerald-500/15',
    hoverRing: 'hover:ring-emerald-200 dark:hover:ring-emerald-500/30',
  },
];

export function LandingPricing({ onNavigateToLogin, onNavigateToRegister }: LandingPricingProps) {
  const { subscriptionFaqs } = useFaq();

  const steps = [
    {
      step: '1',
      title: 'Start Your School',
      desc: 'Register your school and receive 7 days of full access to all features.',
      icon: CheckCircle2,
    },
    {
      step: '2',
      title: 'Make Your Payment',
      desc: 'Pay GH₵300 using the official Mobile Money payment details provided by SamleyEduSuite.',
      icon: CreditCard,
    },
    {
      step: '3',
      title: 'Submit Your Payment',
      desc: 'From the School Admin Dashboard, enter your transaction ID, upload a payment screenshot, and submit.',
      icon: Upload,
    },
    {
      step: '4',
      title: 'Verification',
      desc: 'The SamleyEduSuite Super Admin reviews your payment. Status: Pending Verification.',
      icon: Shield,
    },
    {
      step: '5',
      title: 'Access Reactivated',
      desc: 'Once approved, your subscription becomes active and access is restored immediately.',
      icon: Check,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-800/30 dark:via-slate-900 dark:to-slate-800/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-800/30 mb-6">
            <CreditCard className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Subscription & Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Start with a free trial. Then pay only GH₵300 per month for unlimited school management.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-20">
          <div className="relative bg-white dark:bg-slate-900 border-2 border-orange-500 rounded-3xl shadow-2xl shadow-orange-500/10 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-50" />
            <div className="relative">
              <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-6 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Most Popular</span>
                </div>
                <h3 className="text-lg font-black text-white">SamleyEduSuite School Plan</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-white">GH₵300</span>
                  <span className="text-sm font-medium text-orange-200">/month</span>
                </div>
              </div>
              <div className="p-6 relative">
                {/* Trial Badge */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800/40 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm font-bold text-orange-800 dark:text-orange-200">7-Day Full Access Trial</span>
                  </div>
                  <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                    Start with 7 days of full access to SamleyEduSuite. No school functionality is restricted during the trial.
                  </p>
                </div>
                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {[
                    'Unlimited students, teachers & parents',
                    'All classes KG to JHS',
                    'Attendance & academic results',
                    'Terminal report cards',
                    'Announcements & notifications',
                    'Fee payments tracking',
                    'Realtime updates',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={onNavigateToRegister}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 active:from-orange-800 active:to-orange-700 transition-all shadow-lg shadow-orange-600/25 hover:shadow-xl hover:shadow-orange-600/30 cursor-pointer"
                  >
                    Start Your 7-Day Trial
                  </button>
                  <button
                    onClick={onNavigateToLogin}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-900/40 border border-orange-200 dark:border-orange-800/40 transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How Payment Works */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              How Payment{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Works
              </span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const styles = stepStyles[i];
              return (
                <div key={i} className="relative group">
                  <div
                    className={`relative bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40 rounded-2xl p-6 text-center h-full ring-1 ring-transparent ${styles.hoverRing} hover:shadow-xl ${styles.hoverShadow} hover:border-transparent hover:-translate-y-1.5 transition-all duration-300`}
                  >
                    {/* Ghost step number */}
                    <span
                      aria-hidden
                      className={`absolute top-2 right-3 text-5xl font-black leading-none bg-gradient-to-br ${styles.gradient} bg-clip-text text-transparent opacity-10 select-none pointer-events-none`}
                    >
                      {step.step}
                    </span>

                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${styles.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg ${styles.iconShadow} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-2 ${styles.chip}`}
                    >
                      Step {step.step}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-[18px] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 shadow-md shadow-slate-200/50 dark:shadow-none items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ArrowRight className={`w-4 h-4 ${styles.arrow}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription FAQ */}
        <div>
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Subscription{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                FAQ
              </span>
            </h3>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptionFaqs.map((faq, i) => (
              <SubscriptionFaqItem key={faq.id} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
