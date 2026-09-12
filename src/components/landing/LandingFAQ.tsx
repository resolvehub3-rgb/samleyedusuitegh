import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const faqs = [
  {
    question: 'What is SamleyEduSuite?',
    answer:
      'SamleyEduSuite is a modern digital school management system designed for private schools in Ghana. It provides a connected platform to manage students, teachers, parents, attendance, academic performance, terminal reports, announcements, payments and more.',
  },
  {
    question: 'Who can use SamleyEduSuite?',
    answer:
      'SamleyEduSuite is designed for Ghanaian private schools and their authorized administrators, teachers and parents. School owners register the school, then invite teachers and parents to join.',
  },
  {
    question: 'Is there a student portal?',
    answer:
      'No. SamleyEduSuite does not provide a student login portal. The platform serves school administrators, teachers and parents.',
  },
  {
    question: 'Can parents monitor their wards?',
    answer:
      'Yes. Parents can view their wards\' class, class teacher, attendance history, academic performance, terminal reports, school announcements and receive notifications through the Parent Portal.',
  },
  {
    question: 'Can parents make payments?',
    answer:
      'Yes. Where the school administrator has configured payment functionality, parents can make and monitor school payments through the Parent Portal.',
  },
  {
    question: 'Can teachers record attendance?',
    answer:
      'Yes. Teachers can record daily attendance for classes they are authorized to manage. Administrators can monitor attendance across all classes.',
  },
  {
    question: 'Can teachers generate terminal reports?',
    answer:
      'Yes. Where the school administrator has assigned the required class and report permissions, teachers can generate professional terminal report cards for their students.',
  },
  {
    question: 'Does the platform work on mobile?',
    answer:
      'Yes. The interface is fully responsive and optimized for both mobile phones and desktop computers.',
  },
  {
    question: 'Does the system work in realtime?',
    answer:
      'Yes. Relevant platform features use Supabase Realtime to deliver updates instantly across connected users without requiring page refreshes.',
  },
];

function FAQItem({ question, answer }: React.PropsWithChildren<{ question: string; answer: string }>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-100 dark:border-slate-700/50 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-slate-900 dark:text-white">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-orange-500' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function LandingFAQ() {
  return (
    <SectionWrapper
      id="faq"
      className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
