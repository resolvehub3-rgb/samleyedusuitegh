import React from 'react';
import {
  CheckCircle2, ArrowRight, CreditCard, Shield, Clock, Upload, Check, AlertCircle, HelpCircle
} from 'lucide-react';

interface LandingPricingProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export function LandingPricing({ onNavigateToLogin, onNavigateToRegister }: LandingPricingProps) {
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

  const faqs = [
    { q: 'How much does SamleyEduSuite cost?', a: 'SamleyEduSuite costs GH₵300 per month per school.' },
    { q: 'Is there a trial?', a: 'Yes. Every new school receives 7 days of full access.' },
    { q: 'How do I pay?', a: 'Make the required Mobile Money payment using the official payment details provided by SamleyEduSuite, then submit your transaction ID and payment screenshot from the School Admin Dashboard.' },
    { q: 'How is payment verified?', a: 'The SamleyEduSuite Super Admin manually reviews submitted payment information before approving the subscription.' },
    { q: 'What happens when my subscription expires?', a: 'Access to normal school operations is suspended until payment is submitted and approved. Your school\'s data remains safe and is not deleted.' },
    { q: 'How long does it take to restore access?', a: 'Once the Super Admin approves a valid payment, access is restored immediately.' },
    { q: 'Will I lose my school\'s data after expiry?', a: 'No. Subscription suspension does not delete school data.' },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 rounded-full mb-4">
            <CreditCard className="w-3.5 h-3.5" />
            Subscription & Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Start with a free trial. Then pay only GH₵300 per month for unlimited school management.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-white dark:bg-slate-900 border-2 border-orange-500 rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 text-center">
              <h3 className="text-lg font-black text-white">SamleyEduSuite School Plan</h3>
              <div className="mt-3 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-white">GH₵300</span>
                <span className="text-sm text-orange-200">/month</span>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-bold text-orange-800 dark:text-orange-200">7-Day Full Access Trial</span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Start with 7 days of full access to SamleyEduSuite. No school functionality is restricted during the trial.
                </p>
              </div>
              <ul className="space-y-2.5 mb-6">
                {[
                  'Unlimited students, teachers & parents',
                  'All classes KG to JHS',
                  'Attendance & academic results',
                  'Terminal report cards',
                  'Announcements & notifications',
                  'Fee payments tracking',
                  'Realtime updates',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <button
                  onClick={onNavigateToRegister}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition-all shadow-lg shadow-orange-600/25 cursor-pointer"
                >
                  Start Your 7-Day Trial
                </button>
                <button
                  onClick={onNavigateToLogin}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-900/40 border border-orange-200 dark:border-orange-800/40 transition-colors cursor-pointer"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How Payment Works */}
        <div className="mb-16">
          <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-8">
            How Payment Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center h-full">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mb-1">Step {step.step}</div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-8">
            Subscription FAQ
          </h3>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <summary className="px-5 py-3.5 text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <HelpCircle className="w-4 h-4 text-slate-400 group-open:text-orange-500 shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
