import React, { useState } from 'react';
import { ChevronDown, Sparkles, MessageCircleQuestion } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { useFaq } from '../../context/FaqContext';

function FAQItem({ question, answer, index }: { key?: string; question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`group border rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? 'border-orange-200 dark:border-orange-800/40 bg-white dark:bg-slate-800/60 shadow-lg shadow-orange-500/5'
          : 'border-slate-100 dark:border-slate-700/40 bg-white dark:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-600/60 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-none'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
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

export function LandingFAQ() {
  const { generalFaqs, loading } = useFaq();

  return (
    <SectionWrapper
      id="faq"
      className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-800/30 mb-6">
            <MessageCircleQuestion className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              FAQ
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Everything you need to know about SamleyEduSuite. Can&apos;t find what you&apos;re looking for?{' '}
            <a href="#contact" className="text-orange-500 hover:text-orange-600 font-semibold underline underline-offset-2 decoration-orange-300/50 transition-colors">
              Contact us
            </a>.
          </p>
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/40 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generalFaqs.map((faq, i) => (
              <FAQItem key={faq.id} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Still have questions?{' '}
              <a href="#contact" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                Reach out to our team
              </a>
            </span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
