import React from 'react';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

interface LandingFooterProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export function LandingFooter({ onNavigateToLogin, onNavigateToRegister }: LandingFooterProps) {
  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-300 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Samley<span className="text-orange-400">Edu</span>Suite
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              A modern digital school management solution designed for private schools in Ghana.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigate</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: '#home' },
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'FAQ', href: '#faq' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(href);
                    }}
                    className="text-sm text-slate-400 hover:text-orange-400 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Account</h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={onNavigateToLogin}
                  className="text-sm text-slate-400 hover:text-orange-400 transition-colors"
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToRegister}
                  className="text-sm text-slate-400 hover:text-orange-400 transition-colors"
                >
                  Register Your School
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Configure in platform settings</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Configure in platform settings</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SamleyEduSuite. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
