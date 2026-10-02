import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Check, Sparkles, Zap, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../layout/Logo';
import { loginWithEmail, signupWithEmail, loginWithGoogle, DEMO_USERS, saveStoredUser } from '../../services/authService';
import { UserProfile } from '../../types/user';
import { useToast } from '../ui/NotificationToast';

interface LoginPageProps {
  onAuthSuccess: (user: UserProfile) => void;
  onNavigate: (path: string) => void;
  initialMode?: 'login' | 'signup';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onAuthSuccess,
  onNavigate,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await signupWithEmail(email, name);
        showToast('🎉 Free account created! You have 3 free uses per tool daily.', 'success');
        onAuthSuccess(user);
        onNavigate('/dashboard');
      } else if (mode === 'login') {
        const user = await loginWithEmail(email);
        showToast(`Welcome back, ${user.name}!`, 'success');
        onAuthSuccess(user);
        onNavigate('/dashboard');
      } else {
        showToast('Password reset instructions sent to your email.', 'info');
        setMode('login');
      }
    } catch {
      showToast('Authentication failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      showToast('Signed in with Google', 'success');
      onAuthSuccess(user);
      onNavigate('/dashboard');
    } catch {
      showToast('Google sign-in was interrupted', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = (demoUser: UserProfile) => {
    saveStoredUser(demoUser);
    onAuthSuccess(demoUser);
    showToast(`Logged in as ${demoUser.name} (${demoUser.role.toUpperCase()})`, 'success');
    onNavigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-4">
          <Logo size="lg" showTagline={false} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full Free Access • 3 Uses/Tool/Day</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {mode === 'signup'
            ? 'Create Your Free Account'
            : mode === 'login'
            ? 'Sign In to CM DocFlow AI'
            : 'Reset Your Password'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          {mode === 'signup'
            ? 'Sign up to immediately unlock all 16 PDF and document conversion tools for free.'
            : mode === 'login'
            ? 'Log in to access your free daily conversions, tools, and processing history.'
            : 'Enter your email to receive recovery instructions.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          {/* Quick 1-Click Instant Demo Login */}
          <div className="mb-6 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-current" />
                <span>Instant 1-Click Test Access:</span>
              </span>
              <span className="text-[10px] text-indigo-500 font-semibold">No password needed</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => quickDemoLogin(DEMO_USERS[1])}
                className="py-2 px-1 text-center rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 shadow-xs text-xs font-bold transition-all hover:scale-[1.02]"
              >
                <div className="text-[11px]">👤 Free User</div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Full Free</div>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin(DEMO_USERS[0])}
                className="py-2 px-1 text-center rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 shadow-xs text-xs font-bold transition-all hover:scale-[1.02]"
              >
                <div className="text-[11px]">👑 Admin</div>
                <div className="text-[9px] text-purple-600 dark:text-purple-400 font-medium">Chandra Mohan</div>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin(DEMO_USERS[2])}
                className="py-2 px-1 text-center rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 shadow-xs text-xs font-bold transition-all hover:scale-[1.02]"
              >
                <div className="text-[11px]">⭐ Pro User</div>
                <div className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">Unlimited</div>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Create Free Account
            </button>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition-colors mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Chandra Mohan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="chandramohan.cm.in@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : mode === 'signup' ? (
                <>
                  <span>Create Account & Unlock Free Tools</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'Send Password Reset Link'
              )}
            </button>
          </form>

          {/* Benefits summary list */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {[
              '3 free daily operations per tool (resets at midnight)',
              '100% private in-browser document processing',
              'No credit card required for Free Starter'
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Option to preview landing page / explore tools as guest */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => onNavigate('/landing')}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            ← Or explore features on the Landing Page first
          </button>
        </div>
      </div>
    </div>
  );
};
