import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/home/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { ToolDirectory } from './components/tools/ToolDirectory';
import { ToolWorkspace } from './components/tools/ToolWorkspace';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { ProcessingHistory } from './components/history/ProcessingHistory';
import { BillingPage } from './components/billing/BillingPage';
import { UserSettingsPage } from './components/settings/UserSettingsPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PricingPage } from './components/pricing/PricingPage';
import { LegalPages } from './components/legal/LegalPages';
import { AuthModal } from './components/auth/AuthModal';
import { UpgradeModal } from './components/billing/UpgradeModal';
import { ToastProvider } from './components/ui/NotificationToast';
import { ALL_TOOLS } from './constants/tools';
import { ToolDefinition } from './types/tools';
import { UserProfile } from './types/user';
import { getStoredUser } from './services/authService';
import { getSystemSettings } from './services/adminService';
import { Megaphone } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUser());
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeSourceTool, setUpgradeSourceTool] = useState<string | undefined>(undefined);
  const [systemSettings, setSystemSettings] = useState(getSystemSettings());

  // Listen for browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);

    const handleAuthChange = (e: any) => {
      setCurrentUser(e.detail || getStoredUser());
    };
    window.addEventListener('cm_auth_changed', handleAuthChange);

    const handleSettingsChange = (e: any) => {
      setSystemSettings(e.detail || getSystemSettings());
    };
    window.addEventListener('cm_settings_updated', handleSettingsChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('cm_auth_changed', handleAuthChange);
      window.removeEventListener('cm_settings_updated', handleSettingsChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    if (path.startsWith('/#')) {
      // Anchor link
      const elementId = path.substring(2);
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenUpgrade = (toolName?: string) => {
    setUpgradeSourceTool(toolName);
    setUpgradeModalOpen(true);
  };

  const handleSelectTool = (tool: ToolDefinition) => {
    navigateTo(tool.path);
  };

  // Determine current active tool if on /tools/:toolId
  const activeToolMatch = ALL_TOOLS.find((t) => t.path === currentPath);

  // Dynamic SEO metadata updates
  useEffect(() => {
    if (activeToolMatch) {
      document.title = activeToolMatch.seoTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', activeToolMatch.seoDescription);
    } else if (currentPath === '/pricing') {
      document.title = 'Pricing & Plans – Free & Pro Document Tools | CM DocFlow AI';
    } else if (currentPath === '/dashboard') {
      document.title = 'Dashboard | CM DocFlow AI';
    } else if (currentPath === '/history') {
      document.title = 'Processing History | CM DocFlow AI';
    } else if (currentPath === '/admin') {
      document.title = 'Admin Console | CM DocFlow AI';
    } else if (currentPath === '/login' || (!currentUser && currentPath === '/')) {
      document.title = 'Sign In & Get Free Tools | CM DocFlow AI';
    } else {
      document.title = 'CM DocFlow AI – Every document. One simple workflow.';
    }
  }, [currentPath, activeToolMatch, currentUser]);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        {/* Global Announcement Banner from Admin Settings */}
        {systemSettings.announcementBanner && (
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
            <Megaphone className="w-3.5 h-3.5 shrink-0" />
            <span>{systemSettings.announcementBanner}</span>
          </div>
        )}

        {/* Global Navigation */}
        <Navbar
          user={currentUser}
          onOpenAuth={handleOpenAuth}
          onOpenUpgrade={() => handleOpenUpgrade()}
          currentPath={currentPath}
          onNavigate={navigateTo}
        />

        {/* Main Content Area Based on Current Path & Auth State */}
        <main className="flex-1">
          {/* 1. Explicit Login / Signup Routes */}
          {currentPath === '/login' ? (
            <LoginPage
              initialMode="login"
              onAuthSuccess={(user) => {
                setCurrentUser(user);
                navigateTo('/dashboard');
              }}
              onNavigate={navigateTo}
            />
          ) : currentPath === '/signup' ? (
            <LoginPage
              initialMode="signup"
              onAuthSuccess={(user) => {
                setCurrentUser(user);
                navigateTo('/dashboard');
              }}
              onNavigate={navigateTo}
            />
          ) : /* 2. Root Route: If NOT logged in, show Login Page first! */
          currentPath === '/' && !currentUser ? (
            <LoginPage
              initialMode="login"
              onAuthSuccess={(user) => {
                setCurrentUser(user);
                navigateTo('/dashboard');
              }}
              onNavigate={navigateTo}
            />
          ) : /* 3. Root Route: If logged in, show Dashboard */
          currentPath === '/' && currentUser ? (
            <UserDashboard
              user={currentUser}
              onOpenUpgrade={() => handleOpenUpgrade()}
              onSelectTool={handleSelectTool}
              onNavigate={navigateTo}
            />
          ) : currentPath === '/landing' ? (
            /* Explicit Public Landing Page */
            <LandingPage
              user={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenUpgrade={() => handleOpenUpgrade()}
              onSelectTool={handleSelectTool}
              onNavigate={navigateTo}
            />
          ) : activeToolMatch ? (
            /* Dedicated Tool Workspace for any of the 16 tools */
            <ToolWorkspace
              tool={activeToolMatch}
              user={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenUpgrade={() => handleOpenUpgrade(activeToolMatch.name)}
              onNavigate={navigateTo}
            />
          ) : currentPath === '/tools' ? (
            <ToolDirectory
              user={currentUser}
              onSelectTool={handleSelectTool}
              onOpenUpgrade={() => handleOpenUpgrade()}
            />
          ) : currentPath === '/pricing' ? (
            <PricingPage
              user={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenUpgrade={() => handleOpenUpgrade()}
              onNavigate={navigateTo}
            />
          ) : currentPath === '/dashboard' ? (
            currentUser ? (
              <UserDashboard
                user={currentUser}
                onOpenUpgrade={() => handleOpenUpgrade()}
                onSelectTool={handleSelectTool}
                onNavigate={navigateTo}
              />
            ) : (
              <LoginPage
                initialMode="login"
                onAuthSuccess={(user) => {
                  setCurrentUser(user);
                  navigateTo('/dashboard');
                }}
                onNavigate={navigateTo}
              />
            )
          ) : currentPath === '/history' ? (
            currentUser ? (
              <ProcessingHistory user={currentUser} onNavigate={navigateTo} />
            ) : (
              <LoginPage
                initialMode="login"
                onAuthSuccess={(user) => {
                  setCurrentUser(user);
                  navigateTo('/history');
                }}
                onNavigate={navigateTo}
              />
            )
          ) : currentPath === '/billing' ? (
            currentUser ? (
              <BillingPage
                user={currentUser}
                onOpenUpgrade={() => handleOpenUpgrade()}
                onNavigate={navigateTo}
                onUserUpdated={(u) => setCurrentUser(u)}
              />
            ) : (
              <LoginPage
                initialMode="login"
                onAuthSuccess={(user) => {
                  setCurrentUser(user);
                  navigateTo('/billing');
                }}
                onNavigate={navigateTo}
              />
            )
          ) : currentPath === '/settings' ? (
            currentUser ? (
              <UserSettingsPage
                user={currentUser}
                onUserUpdated={(u) => setCurrentUser(u)}
                onNavigate={navigateTo}
              />
            ) : (
              <LoginPage
                initialMode="login"
                onAuthSuccess={(user) => {
                  setCurrentUser(user);
                  navigateTo('/settings');
                }}
                onNavigate={navigateTo}
              />
            )
          ) : currentPath === '/admin' ? (
            currentUser ? (
              <AdminDashboard user={currentUser} onNavigate={navigateTo} />
            ) : (
              <LoginPage
                initialMode="login"
                onAuthSuccess={(user) => {
                  setCurrentUser(user);
                  navigateTo('/admin');
                }}
                onNavigate={navigateTo}
              />
            )
          ) : currentPath === '/privacy' ? (
            <LegalPages page="privacy" onNavigate={navigateTo} />
          ) : currentPath === '/terms' ? (
            <LegalPages page="terms" onNavigate={navigateTo} />
          ) : currentPath === '/cookies' ? (
            <LegalPages page="cookies" onNavigate={navigateTo} />
          ) : (
            <LandingPage
              user={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenUpgrade={() => handleOpenUpgrade()}
              onSelectTool={handleSelectTool}
              onNavigate={navigateTo}
            />
          )}
        </main>

        {/* Global Footer */}
        <Footer onNavigate={navigateTo} />

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            navigateTo('/dashboard');
          }}
        />

        {/* Upgrade Modal */}
        {currentUser && (
          <UpgradeModal
            isOpen={upgradeModalOpen}
            onClose={() => setUpgradeModalOpen(false)}
            user={currentUser}
            sourceToolName={upgradeSourceTool}
            onUpgradeSuccess={(updated) => {
              setCurrentUser(updated);
            }}
          />
        )}
      </div>
    </ToastProvider>
  );
}
