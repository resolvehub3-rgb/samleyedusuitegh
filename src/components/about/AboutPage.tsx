import React, { useState } from 'react';
import {
  ArrowLeft,
  Sun,
  Moon,
  Eye,
  Target,
  Sparkles,
  Compass,
  Heart,
  Rocket,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Quote,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useScrollAnimation } from '../landing/useScrollAnimation';

interface AboutPageProps {
  onBack: () => void;
  onRegister?: () => void;
}

/* ---------------------------------- Hooks ---------------------------------- */

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  key?: React.Key;
}

function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${className} ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.98]'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------ Founder photo ------------------------------ */

interface FounderAvatarProps {
  src: string;
  alt: string;
  initials: string;
  initialsColor: string;
  ringGradient: string;
  fallbackGradient: string;
  badgeGradient: string;
  badgeShadow: string;
  badgeText: string;
}

/**
 * Circular founder photo with a gradient ring and role badge.
 * Falls back to elegant initials if the photo file is missing or fails to load,
 * so the page never shows a broken image.
 */
function FounderAvatar({
  src,
  alt,
  initials,
  initialsColor,
  ringGradient,
  fallbackGradient,
  badgeGradient,
  badgeShadow,
  badgeText,
}: FounderAvatarProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32">
      <div
        className={`absolute -inset-1.5 rounded-full bg-gradient-to-tr ${ringGradient} opacity-80 blur-[2px] group-hover:opacity-100 transition-opacity`}
      />
      <div className="relative w-full h-full rounded-full bg-white dark:bg-slate-900 p-1.5 shadow-lg">
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center overflow-hidden`}
        >
          {!failed ? (
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`text-3xl font-extrabold ${initialsColor} select-none`}>{initials}</span>
          )}
        </div>
      </div>
      <span
        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-gradient-to-r ${badgeGradient} ${badgeShadow} whitespace-nowrap`}
      >
        {badgeText}
      </span>
    </div>
  );
}

/* --------------------------------- Data ------------------------------------ */

/** Derives personal initials from a name (first + last, e.g. 'Samson Osei Egbetorke' → 'SE'). */
function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

interface FounderProfile {
  name: string;
  role: string;
  photoBadge: string;
  photo: string;
  bio: string;
  achievements: string[];
  quote: string;
  initialsColor: string;
  ringGradient: string;
  fallbackGradient: string;
  badgeGradient: string;
  badgeShadow: string;
  roleColor: string;
  hoverShadow: string;
  barGradient: string;
  glowPos: string;
  glowColor: string;
}

// NOTE: Bios, achievements, and quotes are placeholders — edit freely; names are final.
const founders: FounderProfile[] = [
  {
    name: 'Samson Osei Egbetorke',
    role: 'Founder & CEO',
    photoBadge: 'Founder',
    photo: '/founder.jpg',
    bio: 'Visionary behind SamleyEduSuite — leading product direction and partnerships with schools across Ghana.',
    achievements: [
      'Pioneered a Ghana-first school management platform',
      'Leads product strategy and school partnerships nationwide',
      'Champion of affordable EdTech for private schools',
    ],
    quote: 'Every child in Ghana deserves a school that runs as beautifully as it teaches.',
    initialsColor: 'text-orange-500',
    ringGradient: 'from-orange-500 via-amber-400 to-orange-600',
    fallbackGradient: 'from-orange-100 to-amber-50 dark:from-slate-800 dark:to-slate-800/50',
    badgeGradient: 'from-orange-500 to-amber-500',
    badgeShadow: 'shadow-md shadow-orange-500/40',
    roleColor: 'text-orange-500',
    hoverShadow: 'hover:shadow-orange-500/15',
    barGradient: 'from-orange-500 via-amber-500 to-orange-500',
    glowPos: '-right-20',
    glowColor: 'bg-orange-500/10',
  },
  {
    name: 'Shirley Okine',
    role: 'Assistant Founder',
    photoBadge: 'Asst. Founder',
    photo: '/assistant-founder.jpg',
    bio: 'Co-architect of the platform — driving operations, school onboarding, and the support experience that schools love.',
    achievements: [
      'Architected school onboarding that goes live in days',
      'Drives operations, training, and school support',
      'Built the parent-communication experience schools love',
    ],
    quote: 'Technology should serve teachers — never the other way around.',
    initialsColor: 'text-sky-500',
    ringGradient: 'from-sky-500 via-indigo-400 to-sky-600',
    fallbackGradient: 'from-sky-100 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50',
    badgeGradient: 'from-sky-500 to-indigo-500',
    badgeShadow: 'shadow-md shadow-sky-500/40',
    roleColor: 'text-sky-500',
    hoverShadow: 'hover:shadow-sky-500/15',
    barGradient: 'from-sky-500 via-indigo-500 to-sky-500',
    glowPos: '-left-20',
    glowColor: 'bg-sky-500/10',
  },
];

const values = [
  {
    icon: Heart,
    gradient: 'from-rose-500 to-orange-500',
    glow: 'shadow-rose-500/25',
    title: 'Student First',
    text: 'Every decision we make starts with one question — does this help a child learn better?',
  },
  {
    icon: ShieldCheck,
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/25',
    title: 'Trust & Privacy',
    text: 'School data is sacred. We guard it with bank-grade security and strict access controls.',
  },
  {
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/25',
    title: 'Simplicity',
    text: 'Powerful does not mean complicated. We design tools any teacher can use on day one.',
  },
  {
    icon: Users,
    gradient: 'from-sky-500 to-indigo-500',
    glow: 'shadow-sky-500/25',
    title: 'Partnership',
    text: 'We grow with our schools — listening, improving, and building what they actually need.',
  },
];

const milestones = [
  {
    year: '2026',
    title: 'The Idea Was Born',
    text: 'SamleyEduSuite began with a simple observation — private schools in Ghana were running modern classrooms with paper registers and scattered spreadsheets.',
  },
  {
    year: 'Now',
    title: 'One Platform, Every Role',
    text: 'What started as an idea is now a complete suite connecting administrators, teachers, and parents — attendance, results, payments, and announcements in one place.',
  },
  {
    year: 'Next',
    title: 'Every School, Connected',
    text: 'We are taking SamleyEduSuite to every private school in Ghana and beyond — so no school is left behind by the digital age.',
  },
];

/* --------------------------------- Page ------------------------------------ */

export function AboutPage({ onBack, onRegister }: AboutPageProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-x-hidden">
      {/* ============================= Header ============================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            type="button"
            className="group flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Home
          </button>

          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SamleyEduSuite logo" className="h-9 w-9 rounded-xl object-contain shadow-sm" />
            <span className="text-base font-bold tracking-tight">
              Samley<span className="text-orange-500">Edu</span>Suite
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ============================== Hero ============================== */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 px-4 sm:px-6">
          {/* Ambient background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-3xl animate-float-slow" />
            <div className="absolute top-24 -right-32 w-[26rem] h-[26rem] rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-3xl animate-float-slower" />
            <div className="absolute bottom-0 left-1/3 w-[22rem] h-[22rem] rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-3xl animate-float-slow" />
          </div>

          {/* Grid: text on one side, logo on the other */}
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-12 items-center">
            {/* Text side */}
            <div className="text-center lg:text-left">
              <Reveal>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  About Us
                </span>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                  Empowering Schools.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-[length:200%_auto] animate-gradient-x">
                    Inspiring Futures.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  SamleyEduSuite is a modern school management platform built in Ghana for private
                  schools — connecting administrators, teachers, and parents in one secure,
                  beautiful digital home.
                </p>
              </Reveal>
            </div>

            {/* Logo side */}
            <Reveal delay={300}>
              <div className="relative flex justify-center lg:justify-end">
                {/* Halo glow */}
                <div className="absolute inset-0 m-auto w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-orange-500/25 via-amber-500/20 to-orange-600/25 blur-3xl animate-pulse-slow pointer-events-none" />
                {/* Rotating dashed orbit ring */}
                <div className="absolute inset-0 m-auto w-60 h-60 sm:w-80 sm:h-80 rounded-full border border-dashed border-orange-300/60 dark:border-orange-500/25 animate-spin-slower pointer-events-none" />
                {/* Orbiting accent dot */}
                <div className="absolute inset-0 m-auto w-60 h-60 sm:w-80 sm:h-80 animate-spin-slower pointer-events-none">
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/50" />
                </div>

                <img
                  src="/logo.png"
                  alt="SamleyEduSuite"
                  className="relative w-44 h-44 sm:w-60 sm:h-60 rounded-[2.5rem] object-contain shadow-2xl shadow-orange-500/25 border border-white/50 dark:border-slate-700/50 bg-white dark:bg-slate-900 animate-float-slow"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ========================= Vision & Mission ======================== */}
        <section className="px-4 sm:px-6 pb-24">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Vision */}
            <Reveal>
              <article className="group relative h-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
                {/* Corner glow */}
                <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-sky-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/30 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Eye className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  Our Vision
                  <Compass className="w-4 h-4 text-sky-500" />
                </h2>
                <p className="text-xs font-semibold uppercase tracking-widest text-sky-500 mb-4">
                  Where we are going
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  A Ghana where <span className="font-semibold text-slate-800 dark:text-slate-200">every private school</span> —
                  no matter its size or budget — runs on world-class digital tools, where teachers
                  teach more and manage less, and where parents are true partners in their
                  children&apos;s education.
                </p>
              </article>
            </Reveal>

            {/* Mission */}
            <Reveal delay={150}>
              <article className="group relative h-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-orange-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <Target className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  Our Mission
                  <Rocket className="w-4 h-4 text-orange-500" />
                </h2>
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-4">
                  What drives us daily
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  To simplify school operations — attendance, results, payments, and communication —
                  into <span className="font-semibold text-slate-800 dark:text-slate-200">one intelligent platform</span> that
                  saves time, reduces cost, and keeps every parent close to their child&apos;s
                  learning journey.
                </p>
              </article>
            </Reveal>
          </div>

          {/* Values strip */}
          <div className="max-w-6xl mx-auto mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <div className="group h-full rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-500">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.gradient} shadow-lg ${v.glow} flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110`}
                  >
                    <v.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold mb-1.5">{v.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================ Our Story ============================ */}
        <section className="relative px-4 sm:px-6 py-24 bg-slate-50 dark:bg-slate-900/60 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-orange-500/5 dark:bg-orange-500/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto">
            <Reveal className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Our Story
              </span>
              <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight">
                How SamleyEduSuite Started
              </h2>
            </Reveal>

            {/* Story narrative */}
            <Reveal delay={100}>
              <div className="relative max-w-3xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
                <Sparkles className="absolute -top-4 -left-4 w-9 h-9 text-orange-500 rotate-12" />
                <div className="space-y-5 text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>
                    It started with a familiar frustration. In many private schools across Ghana,
                    attendance lived in a paper register, results were typed and retyped into
                    spreadsheets, fees were chased with handwritten receipts, and parents only
                    discovered problems after they had grown.
                  </p>
                  <p>
                    In <span className="font-semibold text-orange-600 dark:text-orange-400">2026</span>, we
                    asked a simple question: <em className="text-slate-800 dark:text-slate-200">what if
                    one platform could handle it all — beautifully?</em> Not a foreign product that
                    ignored how Ghanaian schools work, but one built here, for here.
                  </p>
                  <p>
                    SamleyEduSuite was born — a school management system designed around real
                    Ghanaian classrooms: real-time attendance, terminal report cards, MoMo-friendly
                    payments, and instant parent announcements, all in one place.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Timeline */}
            <div className="mt-12 grid md:grid-cols-3 gap-5">
              {milestones.map((m, i) => (
                <Reveal key={m.title} delay={i * 150}>
                  <div className="relative h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 hover:-translate-y-1 hover:shadow-xl transition-all duration-500">
                    <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30">
                      {m.year}
                    </span>
                    <h3 className="mt-3 text-base font-bold">{m.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{m.text}</p>
                    {i < milestones.length - 1 && (
                      <ArrowRight className="hidden md:block absolute top-1/2 -right-7 w-5 h-5 text-orange-400/60" />
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================= Founders ============================ */}
        <section className="px-4 sm:px-6 py-24">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                <Users className="w-3.5 h-3.5" />
                Leadership
              </span>
              <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight">Meet the Founders</h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                The people behind SamleyEduSuite — driven by one goal: better schools, brighter
                futures for Ghana's children.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
              {founders.map((f, i) => (
                <Reveal key={f.name} delay={i * 150}>
                  <article className={`group relative flex h-full flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm hover:shadow-2xl ${f.hoverShadow} transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>
                    <div className={`absolute -top-20 ${f.glowPos} w-48 h-48 rounded-full ${f.glowColor} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${f.barGradient} opacity-80`} />

                    {/* Photo — initials show automatically if the file fails to load */}
                    <FounderAvatar
                      src={f.photo}
                      alt={`Portrait of ${f.name}, ${f.role} of SamleyEduSuite`}
                      initials={initialsFromName(f.name)}
                      initialsColor={f.initialsColor}
                      ringGradient={f.ringGradient}
                      fallbackGradient={f.fallbackGradient}
                      badgeGradient={f.badgeGradient}
                      badgeShadow={f.badgeShadow}
                      badgeText={f.photoBadge}
                    />

                    <h3 className="mt-6 text-lg font-bold">{f.name}</h3>
                    <p className={`mt-1 text-xs font-semibold uppercase tracking-widest ${f.roleColor}`}>
                      {f.role}
                    </p>
                    <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {f.bio}
                    </p>

                    {/* Achievements */}
                    <ul className="mt-5 space-y-2 text-left">
                      {f.achievements.map((a) => (
                        <li key={a} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${f.roleColor}`} />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Quote */}
                    <blockquote className="relative mt-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-5 py-4 text-left">
                      <Quote className={`absolute -top-2.5 left-4 w-5 h-5 rounded-full p-0.5 text-white bg-gradient-to-r ${f.badgeGradient} ${f.badgeShadow}`} />
                      <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed">
                        &ldquo;{f.quote}&rdquo;
                      </p>
                    </blockquote>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =============================== CTA =============================== */}
        <section className="px-4 sm:px-6 pb-24">
          <Reveal>
            <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600" />
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/15 blur-3xl animate-float-slow pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-float-slower pointer-events-none" />

              <div className="relative px-8 py-14 sm:px-14 text-center text-white">
                <img
                  src="/logo.png"
                  alt=""
                  aria-hidden="true"
                  className="w-16 h-16 mx-auto rounded-2xl object-contain shadow-lg mb-6 animate-float-slow"
                />
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Join us on the journey
                </h2>
                <p className="mt-3 text-white/85 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                  Whether you run a school of 50 or 5,000 students, SamleyEduSuite is ready to make
                  your work lighter and your school stronger.
                </p>
                <button
                  onClick={onRegister || onBack}
                  type="button"
                  className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-orange-600 bg-white shadow-xl shadow-orange-900/20 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  Register Your School
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ============================= Footer ============================== */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} SamleyEduSuite. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" aria-hidden="true" className="h-6 w-6 rounded-md object-contain" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Built By SamTeck Digital Team
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
