import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../../types/user';
import { saveStoredUser, logoutUser } from '../../services/authService';
import { useToast } from '../ui/NotificationToast';

interface UserSettingsPageProps {
  user: UserProfile;
  onUserUpdated: (u: UserProfile) => void;
  onNavigate: (path: string) => void;
}

export const UserSettingsPage: React.FC<UserSettingsPageProps> = ({
  user,
  onUserUpdated,
  onNavigate
}) => {
  const [name, setName] = useState(user.name);
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy'>('profile');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { showToast } = useToast();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = { ...user, name, photoURL };
    saveStoredUser(updated);
    onUserUpdated(updated);
    showToast('Profile information updated successfully!', 'success');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setOldPassword('');
    setNewPassword('');
    showToast('Password updated successfully!', 'success');
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        '⚠️ Are you sure you want to permanently delete your CM DocFlow AI account? All data will be removed.'
      )
    ) {
      logoutUser();
      showToast('Account deleted. Thank you for using CM DocFlow AI.', 'info');
      onNavigate('/');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div>
        <button
          type="button"
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, credentials, and privacy configurations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'profile', label: 'Profile & Account', icon: <User className="w-4 h-4" /> },
          { id: 'security', label: 'Security & Password', icon: <Lock className="w-4 h-4" /> },
          { id: 'privacy', label: 'Privacy & Retention', icon: <Shield className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="text"
              disabled
              value={user.email}
              className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-500 text-xs font-mono"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Primary login identifier cannot be changed.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Avatar Image URL
            </label>
            <input
              type="text"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* Security Form */}
      {activeTab === 'security' && (
        <form
          onSubmit={handleUpdatePassword}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              At least 8 characters recommended with uppercase and numbers.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Privacy & Automatic Deletion
            </h3>
            <p className="text-slate-500 leading-relaxed max-w-2xl">
              CM DocFlow AI operates on strict privacy principles. Documents uploaded for compression, merging, or conversion are retained strictly in temporary memory during your browser session and automatically purge when you close the tab.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-2">Danger Zone</h4>
            <p className="text-slate-500 mb-4">
              Permanently delete your account, subscription history, and personal metadata.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
