import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';

export function LandingContact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      if (!isSupabaseConfigured()) {
        setError('Contact form is not configured. Please contact support directly.');
        return;
      }

      const supabase = getSupabase();
      const { error: insertError } = await supabase.from('contact_messages').insert({
        full_name: fullName.trim(),
        school_name: schoolName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        message: message.trim(),
      });

      if (insertError) {
        console.error('Failed to save contact message:', insertError);
        setError(`Failed to send message: ${insertError.message}. Please try again or contact us directly.`);
        return;
      }

      // Success
      setSubmitted(true);
      setFullName('');
      setSchoolName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      console.error('Contact form error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email Us',
      value: 'samteckdigital@gmail.com',
      description: 'We respond within 24 hours',
    },
    {
      icon: Phone,
      label: 'Call Us',
      value: '+233 59 434 5424',
      description: 'Mon – Fri, 8am – 5pm GMT',
    },
    {
      icon: MapPin,
      label: 'Visit Us',
      value: 'Mamprobi, Accra, Ghana',
      description: 'Schedule a demo in person',
    },
    {
      icon: Clock,
      label: 'Support Hours',
      value: '24/7 Online Support',
      description: 'Always here to help',
    },
  ];

  return (
    <SectionWrapper id="contact" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Let&apos;s Talk About Your School
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Have questions about SamleyEduSuite? Want a personalized demo for your school?
            We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map(({ icon: Icon, label, value, description }, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-orange-200 dark:hover:border-orange-500/20 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 transition-all group"
              >
                <div className="w-11 h-11 bg-orange-100 dark:bg-orange-500/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-200 dark:group-hover:bg-orange-500/25 transition-colors">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/15 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send a Message</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Fill out the form and we&apos;ll get back to you</p>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 p-3 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-500/15 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">Message Sent!</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mr. Johnson"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                        School Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sunshine Academy"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. johnson@sunshine.edu.gh"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +233 XX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your school and what you're looking for..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
