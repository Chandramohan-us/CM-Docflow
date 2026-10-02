import React, { useState } from 'react';
import { Check, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { PLANS, PRICING_FAQ } from '../../constants/plans';
import { BillingCycle, UserProfile } from '../../types/user';

interface PricingPageProps {
  user: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenUpgrade: () => void;
  onNavigate: (path: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  user,
  onOpenAuth,
  onOpenUpgrade,
  onNavigate
}) => {
  const [cycle, setCycle] = useState<BillingCycle>('yearly');
  const proPlan = PLANS.pro;

  const currentPrice = cycle === 'yearly' ? proPlan.priceYearly : proPlan.priceMonthly;
  const monthlyEquivalent = cycle === 'yearly' ? Math.round(proPlan.priceYearly / 12) : proPlan.priceMonthly;

  const comparisonRows = [
    { feature: 'Daily Conversions per Tool', free: '3 operations / tool', pro: 'Unlimited 24/7' },
    { feature: 'Access to all 16 Utilities', free: 'Included', pro: 'Included' },
    { feature: 'Maximum File Upload Size', free: '25 MB', pro: '100 MB' },
    { feature: 'Batch File Processing', free: 'Up to 5 files', pro: 'Up to 30 files' },
    { feature: 'Multi-Page ZIP Archiving', free: 'Standard', pro: 'High-speed' },
    { feature: 'Processing Queue', free: 'Standard', pro: 'Dedicated Priority' },
    { feature: 'Full Processing Audit History', free: 'Recent 5 jobs', pro: 'Unlimited history' },
    { feature: 'Customer Support', free: 'Community', pro: '24/7 Priority Support' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Freemium & Pro Plans</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Flexible Pricing for Every Workflow
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-3 font-normal">
          Convert documents for free every day, or upgrade to Pro for high-volume batch processing and zero limits.
        </p>

        {/* Cycle Toggle */}
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                cycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Monthly (₹299/mo)
            </button>
            <button
              type="button"
              onClick={() => setCycle('yearly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                cycle === 'yearly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Yearly (₹2,499/yr)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                SAVE 30%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter Plan</div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">₹0</span>
              <span className="text-xs text-slate-500">/ forever</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {PLANS.free.tagline}
            </p>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
              {PLANS.free.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => (user ? onNavigate('/dashboard') : onOpenAuth('signup'))}
            className="mt-8 w-full py-3.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {user ? 'Current Active Plan' : 'Start for Free'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-b from-indigo-50/60 to-white dark:from-indigo-950/40 dark:to-slate-900 border-2 border-indigo-600 shadow-xl flex flex-col justify-between">
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md">
            Recommended
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              CM DocFlow Pro
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                ₹{currentPrice}
              </span>
              <span className="text-xs text-slate-500">
                {cycle === 'yearly' ? `/ year (just ₹${monthlyEquivalent}/mo)` : '/ month'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {PLANS.pro.tagline}
            </p>

            <div className="mt-8 pt-6 border-t border-indigo-100 dark:border-indigo-900/50 space-y-3.5">
              {PLANS.pro.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  <div className="w-4 h-4 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenUpgrade}
            className="mt-8 w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            {user?.plan === 'pro' ? 'Manage Pro Plan' : 'Upgrade to Pro with Razorpay'}
          </button>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Detailed Feature Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3">Capability</th>
                <th className="pb-3">Free Plan</th>
                <th className="pb-3 text-indigo-600 dark:text-indigo-400">CM DocFlow Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {comparisonRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{row.feature}</td>
                  <td className="py-3 text-slate-500">{row.free}</td>
                  <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-6">
          Billing & Subscription Questions
        </h3>
        {PRICING_FAQ.map((faq, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
          >
            <div className="font-bold text-slate-900 dark:text-white">{faq.q}</div>
            <div className="text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
