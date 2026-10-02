import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Zap,
  Sparkles,
  Shield,
  Layers,
  History,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';
import { Logo } from './Logo';
import { UserProfile } from '../../types/user';
import { logoutUser, DEMO_USERS, saveStoredUser } from '../../services/authService';
import { getTodayUsageSummary } from '../../services/usageService';
import { useToast } from '../ui/NotificationToast';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenUpgrade: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onOpenUpgrade,
  currentPath,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [todayUsageCount, setTodayUsageCount] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    // Check initial dark mode from document or system
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    const updateUsage = () => {
      if (user) {
        const summary = getTodayUsageSummary(user.id);
        const total = Object.values(summary).reduce((a, b) => a + b, 0);
        setTodayUsageCount(total);
      }
    };

    updateUsage();
    window.addEventListener('cm_usage_updated', updateUsage);
    return () => window.removeEventListener('cm_usage_updated', updateUsage);
  }, [user]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUserDropdownOpen(false);
    showToast('Signed out successfully', 'info');
    onNavigate('/');
  };

  const switchAccount = (demoUser: UserProfile) => {
    saveStoredUser(demoUser);
    setDemoDropdownOpen(false);
    window.dispatchEvent(new CustomEvent('cm_auth_changed', { detail: demoUser }));
    showToast(`Switched account to: ${demoUser.name} (${demoUser.role.toUpperCase()})`, 'success');
  };

  const navLinks = [
    { label: 'Tools', path: '/tools' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Features', path: '/#features' },
    { label: 'FAQ', path: '/#faq' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center focus:outline-none"
          >
            <Logo size="md" showTagline={false} />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => onNavigate(link.path)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentPath === link.path
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              title="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-750 transition-colors"
                title="Switch test persona instantly"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {user
                    ? user.role === 'admin'
                      ? 'Admin'
                      : user.plan === 'pro'
                      ? 'Pro Plan'
                      : 'Free Plan'
                    : 'Quick Sign In'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Test Persona
                  </div>
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => switchAccount(demo)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                        user?.id === demo.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{demo.name}</div>
                        <div className="text-[10px] text-slate-400">{demo.email}</div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-200 dark:bg-slate-700 shrink-0">
                        {demo.role === 'admin' ? 'Admin' : demo.plan}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* If user logged in */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* Upgrade Button if Free */}
                {user.plan === 'free' && (
                  <button
                    type="button"
                    onClick={onOpenUpgrade}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upgrade Pro</span>
                  </button>
                )}

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <img
                      src={
                        user.photoURL ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          {user.plan === 'pro' ? '⭐ Pro Plan' : 'Free (3/tool/day)'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('/dashboard');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('/history');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <History className="w-4 h-4 text-slate-500" />
                        <span>Processing History</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('/billing');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-slate-500" />
                        <span>Billing & Subscription</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('/settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>Settings</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('/admin');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors mt-1"
                        >
                          <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Admin Console</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/signup')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Start for Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.path);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {link.label}
              </button>
            ))}
          </div>

          {user ? (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/dashboard');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400"
              >
                Dashboard
              </button>
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/admin');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400"
                >
                  Admin Console
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 dark:text-rose-400"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/login');
                }}
                className="py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold text-center text-slate-700 dark:text-slate-200"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/signup');
                }}
                className="py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold text-center"
              >
                Start Free
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
