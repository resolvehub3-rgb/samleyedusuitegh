import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LandingNavbarProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Schools', href: '#for-schools' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export function LandingNavbar({ onNavigateToLogin, onNavigateToRegister }: LandingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#home');
            }}
            className="flex items-center gap-2 shrink-0"
          >
            <img src="/logo1.png" alt="SamleyEduSuite" className="w-9 h-9 rounded-xl object-contain shadow-sm" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Samley<span className="text-orange-500">Edu</span>Suite
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl transition-colors"
            >
              Login
            </button>
            <button
              onClick={onNavigateToRegister}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-[0.98]"
            >
              Register Your School
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-500 rounded-lg"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="block px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToLogin();
                }}
                className="w-full px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToRegister();
                }}
                className="w-full px-4 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition-all"
              >
                Register Your School
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
