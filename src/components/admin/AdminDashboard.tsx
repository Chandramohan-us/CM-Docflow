import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  Layers,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  ArrowLeft
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { UserProfile } from '../../types/user';
import { SystemSettings } from '../../types/usage';
import {
  getAdminAnalytics,
  getAdminUsersList,
  updateAdminUser,
  getSystemSettings,
  saveSystemSettings,
  AdminAnalyticsData
} from '../../services/adminService';
import { useToast } from '../ui/NotificationToast';

interface AdminDashboardProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'settings'>('overview');
  const [analytics, setAnalytics] = useState<AdminAnalyticsData>(getAdminAnalytics());
  const [usersList, setUsersList] = useState(getAdminUsersList());
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(getSystemSettings());
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const { showToast } = useToast();

  if (user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This portal requires administrator privileges. Please sign in with an authorized admin account.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleToggleUserPlan = (targetUser: any) => {
    const newPlan = targetUser.plan === 'pro' ? 'free' : 'pro';
    updateAdminUser(targetUser.id, { plan: newPlan });
    setUsersList(getAdminUsersList());
    showToast(`Updated ${targetUser.name}'s plan to ${newPlan.toUpperCase()}`, 'success');
  };

  const handleToggleSuspension = (targetUser: any) => {
    const newStatus = !targetUser.isSuspended;
    updateAdminUser(targetUser.id, { isSuspended: newStatus });
    setUsersList(getAdminUsersList());
    showToast(
      `${targetUser.name} has been ${newStatus ? 'suspended' : 'reactivated'}`,
      newStatus ? 'error' : 'success'
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSystemSettings(systemSettings);
    showToast('System settings and limits saved successfully!', 'success');
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to User Dashboard</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Admin Console
              </h1>
              <p className="text-xs text-slate-500">
                Logged in as Super Admin: <span className="font-mono text-indigo-500">{user.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold overflow-x-auto">
          {[
            { id: 'overview', label: 'Platform Stats' },
            { id: 'users', label: 'User Management' },
            { id: 'analytics', label: 'Tool Analytics' },
            { id: 'settings', label: 'System Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {analytics.totalUsers.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                +{analytics.activeUsersToday} active today
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Total Conversions</span>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {analytics.totalConversions.toLocaleString()}
              </div>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                {analytics.conversionsToday} operations today
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Monthly Recurring (MRR)</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ₹{analytics.mrrINR.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {analytics.proUsers} paid subscribers
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Conversion Success</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {analytics.successRate}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">0.6% failed / cancelled</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Growth Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Weekly Document Processing Volume
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.conversionGrowth}>
                    <defs>
                      <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="free"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#colorFree)"
                      name="Free Tier"
                    />
                    <Area
                      type="monotone"
                      dataKey="pro"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorPro)"
                      name="Pro Tier"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Trajectory Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Monthly Razorpay Revenue (INR ₹)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.revenueGrowth}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. User Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search registered users by name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing {filteredUsers.length} registered accounts
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Plan</th>
                    <th className="py-3.5 px-4">Conversions</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.plan === 'pro'
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{u.totalConversions || 12}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isSuspended ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleUserPlan(u)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold"
                        >
                          Switch to {u.plan === 'pro' ? 'Free' : 'Pro'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSuspension(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                            u.isSuspended
                              ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                          }`}
                        >
                          {u.isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tool Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Most Utilized Operations
            </h3>
            <div className="space-y-4">
              {analytics.toolPopularity.map((tp, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{tp.name}</span>
                    <span className="text-slate-500">
                      {tp.uses.toLocaleString()} uses ({tp.share}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${tp.share * 3}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. System Settings Tab */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 max-w-3xl"
        >
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              System Configurations & Limits
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust global quotas and pricing variables. Changes take effect immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Free Daily Limit Per Tool
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={systemSettings.freeDailyLimitPerTool}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    freeDailyLimitPerTool: parseInt(e.target.value, 10) || 3
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard: 3 operations per tool per day.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Free Max File Size (MB)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={systemSettings.freeMaxFileSizeMB}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    freeMaxFileSizeMB: parseInt(e.target.value, 10) || 25
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 25 MB.</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pro Monthly Price (INR ₹)
              </label>
              <input
                type="number"
                value={systemSettings.priceMonthlyINR}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    priceMonthlyINR: parseInt(e.target.value, 10) || 299
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pro Yearly Price (INR ₹)
              </label>
              <input
                type="number"
                value={systemSettings.priceYearlyINR}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    priceYearlyINR: parseInt(e.target.value, 10) || 2499
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Global Announcement Banner
            </label>
            <input
              type="text"
              value={systemSettings.announcementBanner}
              onChange={(e) =>
                setSystemSettings({ ...systemSettings, announcementBanner: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
