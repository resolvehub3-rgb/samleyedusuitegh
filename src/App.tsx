import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SuperAdminProvider, useSuperAdmin } from './context/SuperAdminContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { FaqProvider } from './context/FaqContext';
import { PwaInstallBanner } from './components/common/PwaInstallBanner';
import { SubscriptionLockGuard } from './components/subscription/SubscriptionLockGuard';
import { SubscriptionNotice } from './components/subscription/SubscriptionNotice';
import { MaintenancePage } from './components/common/MaintenancePage';
import { getSupabase } from './lib/supabase';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { AboutPage } from './components/about/AboutPage';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { TermsOfService } from './components/legal/TermsOfService';

// Auth Views
import { LoginView } from './components/auth/LoginView';
import { RegisterSchoolView } from './components/auth/RegisterSchoolView';
import { AcceptInvitationView } from './components/auth/AcceptInvitationView';
import { CompleteSchoolSetupView } from './components/auth/CompleteSchoolSetupView';
import { ForcePasswordReset } from './components/auth/ForcePasswordReset';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherManagement } from './components/admin/TeacherManagement';
import { StudentManagement } from './components/admin/StudentManagement';
import { ParentsManagement } from './components/admin/ParentsManagement';
import { ClassManagement } from './components/admin/ClassManagement';
import { SubjectManagement } from './components/admin/SubjectManagement';
import { AttendanceOverview } from './components/admin/AttendanceOverview';
import { AcademicResultsEntry } from './components/reports/AcademicResultsEntry';
import { TerminalReportCard } from './components/reports/TerminalReportCard';
import { PaymentManagement } from './components/payments/PaymentManagement';
import { AnnouncementManagement } from './components/announcements/AnnouncementManagement';
import { TeacherReviewsView } from './components/reviews/TeacherReviewsView';
import { ParentFeedbackView } from './components/feedback/ParentFeedbackView';
import { SchoolSettingsView } from './components/admin/SchoolSettingsView';

// Teacher & Parent Views
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { ParentWardsView } from './components/parent/ParentWardsView';

// Super Admin Views
import { SuperAdminLogin } from './components/super-admin/SuperAdminLogin';
import { SuperAdminLayout } from './components/super-admin/SuperAdminLayout';
import { SuperAdminDashboard } from './components/super-admin/SuperAdminDashboard';
import { SuperAdminSchools } from './components/super-admin/SuperAdminSchools';
import { SuperAdminSchoolDetails } from './components/super-admin/SuperAdminSchoolDetails';
import { SuperAdminUsers } from './components/super-admin/SuperAdminUsers';
import { SuperAdminTeachers } from './components/super-admin/SuperAdminTeachers';
import { SuperAdminParents } from './components/super-admin/SuperAdminParents';
import { SuperAdminStudents } from './components/super-admin/SuperAdminStudents';
import { SuperAdminPayments } from './components/super-admin/SuperAdminPayments';
import { SuperAdminAnnouncements } from './components/super-admin/SuperAdminAnnouncements';
import { SuperAdminNotifications } from './components/super-admin/SuperAdminNotifications';
import { SuperAdminActivity } from './components/super-admin/SuperAdminActivity';
import { SuperAdminStorage } from './components/super-admin/SuperAdminStorage';
import { SuperAdminSettings } from './components/super-admin/SuperAdminSettings';
import { SuperAdminProfile } from './components/super-admin/SuperAdminProfile';
import { SuperAdminSubscriptions } from './components/super-admin/SuperAdminSubscriptions';
import { SuperAdminContactMessages } from './components/super-admin/SuperAdminContactMessages';

// Super Admin App Content
function SuperAdminApp() {
  const { user, isSuperAdmin, loading: saLoading } = useSuperAdmin();
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState<any>('dashboard');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  if (saLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Loading Super Admin Dashboard...</p>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <SuperAdminLogin />;
  }

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    if (id) setSelectedSchoolId(id);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'schools': return <SuperAdminSchools onNavigate={handleNavigate} />;
      case 'school-details': return selectedSchoolId ? <SuperAdminSchoolDetails schoolId={selectedSchoolId} onNavigate={(v) => setCurrentView(v)} /> : <SuperAdminSchools onNavigate={handleNavigate} />;
      case 'users': return <SuperAdminUsers />;
      case 'teachers': return <SuperAdminTeachers />;
      case 'parents': return <SuperAdminParents />;
      case 'students': return <SuperAdminStudents />;
      case 'payments': return <SuperAdminPayments />;
      case 'subscriptions': return <SuperAdminSubscriptions />;
      case 'contact-messages': return <SuperAdminContactMessages />;
      case 'announcements': return <SuperAdminAnnouncements />;
      case 'notifications': return <SuperAdminNotifications />;
      case 'activity': return <SuperAdminActivity />;
      case 'storage': return <SuperAdminStorage />;
      case 'settings': return <SuperAdminSettings />;
      case 'profile': return <SuperAdminProfile />;
      case 'dashboard':
      default: return <SuperAdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <SuperAdminLayout currentView={currentView} onNavigate={handleNavigate}>
      {renderContent()}
    </SuperAdminLayout>
  );
}

// Main App Content (non-super-admin)
function AppContent() {
  const { user, profile, school, loading, logout, refreshProfile } = useAuth();
  const getInitialAuthMode = (): 'login' | 'register' | 'accept-invite' => {
    const path = window.location.pathname;
    if (path === '/register') return 'register';
    if (path === '/accept-invite' || path === '/invite') return 'accept-invite';
    return 'login';
  };
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'accept-invite'>(getInitialAuthMode);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(() => window.location.pathname === '/');
  const [showLegalPage, setShowLegalPage] = useState<'privacy' | 'terms' | null>(() => {
    const path = window.location.pathname;
    if (path === '/privacy-policy') return 'privacy';
    if (path === '/terms-of-service') return 'terms';
    return null;
  });
  const [showAboutPage, setShowAboutPage] = useState<boolean>(() => window.location.pathname === '/about');
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Handle browser back/forward for legal pages
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/privacy-policy') {
        setShowLegalPage('privacy');
        setShowLanding(false);
      } else if (path === '/terms-of-service') {
        setShowLegalPage('terms');
        setShowLanding(false);
      } else if (path === '/about') {
        setShowLegalPage(null);
        setShowLanding(false);
        setShowAboutPage(true);
      } else if (path === '/') {
        setShowLegalPage(null);
        setShowAboutPage(false);
        setShowLanding(true);
      } else {
        setShowLegalPage(null);
        setShowAboutPage(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Subscription hook MUST be called before any conditional returns (Rules of Hooks)
  const { isSuspended, isExpired, loading: subLoading, subscription } = useSubscription();

  // Maintenance mode state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);

  // Fetch maintenance mode and subscribe to realtime changes
  useEffect(() => {
    const supabase = getSupabase();

    const fetchMaintenanceMode = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('setting_value')
          .eq('setting_key', 'maintenance_mode')
          .single();

        if (!error && data) {
          setMaintenanceMode(data.setting_value === 'true');
        }
      } catch {}
      setMaintenanceLoading(false);
    };

    fetchMaintenanceMode();

    // Realtime: listen for changes to maintenance_mode
    const channel = supabase
      .channel('maintenance_mode_watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_settings' }, (payload) => {
        const row = payload.new as any;
        if (row?.setting_key === 'maintenance_mode') {
          setMaintenanceMode(row.setting_value === 'true');
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Show force password reset for teachers and parents with must_reset_password flag
  useEffect(() => {
    if ((profile?.role === 'teacher' || profile?.role === 'parent') && profile.must_reset_password) {
      setShowPasswordReset(true);
    }
  }, [profile]);

  // Check URL token for invitation links on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const token = urlParams.get('token') || hashParams.get('token') || urlParams.get('invite_token');

    if (token) {
      setAuthMode('accept-invite');
      setShowLanding(false);
    }
  }, []);

  // Loading Splash Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <img src="/logo.png" alt="SamleyEduSuite" className="w-50 h-50 rounded-xl object-contain animate-pulse shadow-md shadow-orange-500/15" />
        <p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
          Connecting to SamleyEduSuite Ghana...
        </p>
      </div>
    );
  }

  // Super Admin Role -> Route to Super Admin Dashboard
  // Check profile role OR user metadata for super_admin
  if (profile?.role === 'super_admin' || (user?.user_metadata as any)?.role === 'super_admin') {
    return <SuperAdminApp />;
  }

  // Not Logged In -> Landing Page or Auth Screens
  if (!user) {
    const path = window.location.pathname;

    const goHome = () => {
      window.history.pushState({}, '', '/');
      setShowLegalPage(null);
      setShowAboutPage(false);
      setShowLanding(true);
      setAuthMode('login');
    };

    // Show About page (standalone)
    if (showAboutPage) {
      return (
        <AboutPage
          onBack={() => {
            window.history.pushState({}, '', '/');
            setShowAboutPage(false);
            setShowLanding(true);
          }}
          onRegister={() => {
            window.history.pushState({}, '', '/register');
            setShowAboutPage(false);
            setAuthMode('register');
          }}
        />
      );
    }

    // Show legal pages (not in navbar, standalone)
    if (showLegalPage === 'privacy') {
      return (
        <PrivacyPolicy
          onBack={() => {
            window.history.pushState({}, '', '/');
            setShowLegalPage(null);
            setShowLanding(true);
          }}
        />
      );
    }
    if (showLegalPage === 'terms') {
      return (
        <TermsOfService
          onBack={() => {
            window.history.pushState({}, '', '/');
            setShowLegalPage(null);
            setShowLanding(true);
          }}
        />
      );
    }

    // Show landing page at root path only when in login mode (default)
    if (showLanding && path === '/') {
      return (
        <LandingPage
          onNavigateToLogin={() => {
            window.history.pushState({}, '', '/login');
            setShowLanding(false);
            setAuthMode('login');
          }}
          onNavigateToRegister={() => {
            window.history.pushState({}, '', '/register');
            setShowLanding(false);
            setAuthMode('register');
          }}
          onNavigateToPrivacy={() => {
            window.history.pushState({}, '', '/privacy-policy');
            setShowLanding(false);
            setShowLegalPage('privacy');
          }}
          onNavigateToTerms={() => {
            window.history.pushState({}, '', '/terms-of-service');
            setShowLanding(false);
            setShowLegalPage('terms');
          }}
          onNavigateToAbout={() => {
            window.history.pushState({}, '', '/about');
            setShowLanding(false);
            setShowAboutPage(true);
          }}
        />
      );
    }
    if (authMode === 'register' || path === '/register') {
      return (
        <RegisterSchoolView
          onNavigateToLogin={() => {
            window.history.pushState({}, '', '/login');
            setAuthMode('login');
          }}
          onSwitchToLogin={() => {
            window.history.pushState({}, '', '/login');
            setAuthMode('login');
          }}
          onNavigateToHome={goHome}
        />
      );
    }
    if (authMode === 'accept-invite') {
      return (
        <AcceptInvitationView
          onNavigateToLogin={() => {
            window.history.pushState({}, '', '/login');
            setAuthMode('login');
          }}
          onSwitchToLogin={() => {
            window.history.pushState({}, '', '/login');
            setAuthMode('login');
          }}
          onNavigateToHome={goHome}
        />
      );
    }
    return (
      <LoginView
        onNavigateToRegister={() => {
          window.history.pushState({}, '', '/register');
          setAuthMode('register');
        }}
        onSwitchToRegister={() => {
          window.history.pushState({}, '', '/register');
          setAuthMode('register');
        }}
        onNavigateToInvitation={() => setAuthMode('accept-invite')}
        onSwitchToAcceptInvite={() => setAuthMode('accept-invite')}
        onNavigateToHome={goHome}
      />
    );
  }

  // Fallback: User authenticated but has no school profile attached
  if (!profile || !school) {
    return <CompleteSchoolSetupView />;
  }

  // Compute subscription lock state (no longer blocks, just shows overlay)
  const userRole = profile?.role as string;
  const isPaidPastExpiry = (
    subscription?.status === 'ACTIVE' &&
    subscription?.subscription_expires_at &&
    new Date(subscription.subscription_expires_at).getTime() < Date.now()
  );
  const isTrialPastExpiry = (
    subscription?.status === 'TRIAL' &&
    subscription?.trial_expires_at &&
    new Date(subscription.trial_expires_at).getTime() < Date.now()
  );
  const isPastExpiry = isPaidPastExpiry || isTrialPastExpiry;
  const isSubscriptionLocked = !subLoading && (isExpired || isPastExpiry) && userRole !== 'super_admin';

  // Render Role-Based Screen
  const renderViewContent = () => {
    const role = profile.role;

    // Common/Shared routes
    if (currentView === 'attendance') {
      // Allow admin access to all attendance, but for teachers only class teachers
      if (role === 'teacher') {
        // Teachers can only mark attendance if they are class teachers
        // The AttendanceOverview component handles filtering
      }
      return <AttendanceOverview />;
    }
    if (currentView === 'reports') return <TerminalReportCard />;
    if (currentView === 'terminal-reports') return <TerminalReportCard />;
    if (currentView === 'results') return <AcademicResultsEntry />;
    if (currentView === 'academic-results') return <AcademicResultsEntry />;
    if (currentView === 'payments') return <PaymentManagement />;
    if (currentView === 'announcements') return <AnnouncementManagement />;
    if (currentView === 'reviews' || currentView === 'teacher-reviews') return <TeacherReviewsView />;
    if (currentView === 'teacher') return <TeacherReviewsView />;
    if (currentView === 'feedback' || currentView === 'parent-feedback') return <ParentFeedbackView />;

    // Role-specific routes
    if (role === 'admin') {
      switch (currentView) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setCurrentView} />;
        case 'teachers':
          return <TeacherManagement />;
        case 'students':
          return <StudentManagement />;
        case 'parents':
          return <ParentsManagement />;
        case 'promotions':
          return <StudentManagement />;
        case 'classes':
          return <ClassManagement />;
        case 'subjects':
          return <SubjectManagement />;
        case 'settings':
          return <SchoolSettingsView />;
        default:
          return <AdminDashboard onNavigate={setCurrentView} />;
      }
    }

    if (role === 'teacher') {
      switch (currentView) {
        case 'dashboard':
          return <TeacherDashboard onNavigate={setCurrentView} />;
        case 'classes':
          return <ClassManagement />;
        default:
          return <TeacherDashboard onNavigate={setCurrentView} />;
      }
    }

    if (role === 'parent') {
      switch (currentView) {
        case 'dashboard':
          return <ParentDashboard onNavigate={setCurrentView} />;
        case 'wards':
          return <ParentWardsView onNavigate={setCurrentView} />;
        default:
          return <ParentDashboard onNavigate={setCurrentView} />;
      }
    }

    return <AdminDashboard onNavigate={setCurrentView} />;
  };

  // Show loading while subscription is being fetched
  if (subLoading && userRole !== 'super_admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  // Maintenance mode: show maintenance page for non-super-admin users
  if (maintenanceMode && !maintenanceLoading) {
    return <MaintenancePage onLogout={logout} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <div className="print:hidden sticky top-0 z-40">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
          onNavigateToNotifications={() => setCurrentView('announcements')}
        />
      </div>

      <div className="flex-1 flex">
        <div className="print:hidden">
          <Sidebar
            currentView={currentView}
            onSelectView={setCurrentView}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        <main className="flex-1 lg:pl-64 min-w-0 print:pl-0">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto print:p-0 print:max-w-none">
            {renderViewContent()}
          </div>
        </main>
      </div>

      {/* Force Password Reset Modal for Teachers and Parents */}
      {(profile.role === 'teacher' || profile.role === 'parent') && profile.must_reset_password && showPasswordReset && (
        <ForcePasswordReset
          onComplete={async () => {
            setShowPasswordReset(false);
            // Refresh profile to clear must_reset_password flag
            await refreshProfile();
          }}
        />
      )}

      {/* Subscription Lock Guard Overlay - different for admin vs teachers/parents */}
      {isSubscriptionLocked && userRole === 'admin' && <SubscriptionLockGuard />}
      {isSubscriptionLocked && (userRole === 'teacher' || userRole === 'parent') && <SubscriptionNotice role={userRole} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <SuperAdminProvider>
            <SubscriptionProvider>
              <FaqProvider>
                <AppContent />
                <PwaInstallBanner />
              </FaqProvider>
            </SubscriptionProvider>
          </SuperAdminProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
