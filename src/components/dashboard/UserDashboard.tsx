import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  History,
  FileCheck,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { UserProfile } from '../../types/user';
import { ALL_TOOLS } from '../../constants/tools';
import { ToolDefinition } from '../../types/tools';
import { getTodayUsageSummary } from '../../services/usageService';
import { getStoredJobs } from '../../services/jobHistoryService';
import { formatBytes } from '../../lib/image/imageEngine';

interface UserDashboardProps {
  user: UserProfile;
  onOpenUpgrade: () => void;
  onSelectTool: (tool: ToolDefinition) => void;
  onNavigate: (path: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onOpenUpgrade,
  onSelectTool,
  onNavigate
}) => {
  const [usageSummary, setUsageSummary] = useState<{ [toolId: string]: number }>({});
  const [recentJobs, setRecentJobs] = useState(getStoredJobs(user.id));

  useEffect(() => {
    const refreshData = () => {
      setUsageSummary(getTodayUsageSummary(user.id));
      setRecentJobs(getStoredJobs(user.id));
    };

    refreshData();
    window.addEventListener('cm_usage_updated', refreshData);
    window.addEventListener('cm_jobs_updated', refreshData);
    return () => {
      window.removeEventListener('cm_usage_updated', refreshData);
      window.removeEventListener('cm_jobs_updated', refreshData);
    };
  }, [user]);

  const totalUsedToday = Object.values(usageSummary).reduce((a, b) => a + b, 0);
  const totalCompletedJobs = recentJobs.length;
  const isPro = user.plan === 'pro';

  // Highlighted common tools to show on dashboard usage card
  const sampleTrackedTools = [
    ALL_TOOLS.find((t) => t.id === 'image-to-pdf')!,
    ALL_TOOLS.find((t) => t.id === 'merge-pdf')!,
    ALL_TOOLS.find((t) => t.id === 'pdf-compressor')!,
    ALL_TOOLS.find((t) => t.id === 'split-pdf')!,
    ALL_TOOLS.find((t) => t.id === 'pdf-to-image')!,
    ALL_TOOLS.find((t) => t.id === 'image-format-converter')!
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-indigo-200">
            <span>{isPro ? '⭐ Pro Subscription Active' : '⚡ Free Plan (3/day per tool)'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {isPro
              ? 'You have unlimited conversions on all 16 tools with high-priority processing.'
              : 'You have 3 free conversions for each tool every day. Resets at midnight.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isPro && (
            <button
              type="button"
              onClick={onOpenUpgrade}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade to Pro</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('/tools')}
            className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20"
          >
            Explore Tools
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Current Tier
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {isPro ? 'PRO PLAN' : 'FREE STARTER'}
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
            {isPro ? 'Unlimited daily quota' : '3 uses per tool daily'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Conversions Today
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalUsedToday}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            Across active tools
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total History Jobs
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalCompletedJobs}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-semibold">
            All processed files
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            File Limit
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {isPro ? '100 MB' : '25 MB'}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-semibold">
            Max single document size
          </div>
        </div>
      </div>

      {/* Today's Usage Breakdown (Requirement 7) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Today's Tool Usage Meter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Limits are tracked per tool. Each tool resets to 0 at midnight.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/tools')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All 16 Tools →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {sampleTrackedTools.map((t) => {
            const count = usageSummary[t.id] || 0;
            const limit = 3;
            const pct = isPro ? 100 : Math.min(100, (count / limit) * 100);

            return (
              <div
                key={t.id}
                onClick={() => onSelectTool(t)}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    {t.name}
                  </span>
                  <span className="font-mono text-slate-500">
                    {isPro ? `${count} (Unlimited)` : `${count} / ${limit}`}
                  </span>
                </div>

                {/* Progress Meter */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isPro
                        ? 'bg-indigo-600'
                        : count >= limit
                        ? 'bg-rose-500'
                        : count > 0
                        ? 'bg-amber-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
                  <span>{isPro ? 'Pro Unlocked' : `${Math.max(0, limit - count)} free left today`}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    Use Tool →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Processing Activity Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Processing Activity
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/history')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Full History →
          </button>
        </div>

        {recentJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Document</th>
                  <th className="pb-3 font-semibold">Tool</th>
                  <th className="pb-3 font-semibold">Size</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentJobs.slice(0, 5).map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-bold text-slate-900 dark:text-white max-w-[200px] truncate">
                      {job.outputFileName || job.inputFileName}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 capitalize">
                      {job.toolId.replace(/-/g, ' ')}
                    </td>
                    <td className="py-3 font-mono text-slate-500">
                      {formatBytes(job.fileSize)}
                    </td>
                    <td className="py-3 text-slate-500 font-mono">
                      {(job.processingTimeMs / 1000).toFixed(1)}s
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            No document conversions performed yet. Select any tool above to get started!
          </div>
        )}
      </div>
    </div>
  );
};
