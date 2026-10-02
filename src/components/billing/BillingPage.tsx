import React, { useState } from 'react';
import { CreditCard, Check, ArrowRight, Sparkles, Download, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types/user';
import { PLANS } from '../../constants/plans';
import { getStoredInvoices, cancelSubscription } from '../../services/subscriptionService';
import { useToast } from '../ui/NotificationToast';

interface BillingPageProps {
  user: UserProfile;
  onOpenUpgrade: () => void;
  onNavigate: (path: string) => void;
  onUserUpdated: (u: UserProfile) => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({
  user,
  onOpenUpgrade,
  onNavigate,
  onUserUpdated
}) => {
  const [cancelling, setCancelling] = useState(false);
  const invoices = getStoredInvoices(user.id);
  const isPro = user.plan === 'pro';
  const { showToast } = useToast();

  const handleCancelSub = async () => {
    if (window.confirm('Are you sure you want to cancel your Pro subscription? You will lose unlimited processing.')) {
      setCancelling(true);
      await cancelSubscription(user.id);
      setCancelling(false);
      onUserUpdated({ ...user, plan: 'free', subscriptionStatus: 'none' });
      showToast('Subscription cancelled. You are now on Free Starter.', 'info');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Billing & Subscriptions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your plan, payment methods, and downloadable Razorpay tax invoices.
        </p>
      </div>

      {/* Plan Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Plan</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {isPro ? 'CM DocFlow Pro' : 'Free Starter'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isPro
                ? `Unlimited conversions • Billed ${user.billingCycle || 'monthly'} via Razorpay`
                : '3 free operations per tool every single day. Upgrade anytime.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isPro ? (
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Pro</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelSub}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        </div>

        {/* Plan Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 font-semibold">Tool Usage Quota</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {isPro ? 'Unlimited (All 16 Tools)' : '3 Conversions / Tool / Day'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 font-semibold">Maximum File Size</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {isPro ? '100 MB per file' : '25 MB per file'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 font-semibold">Next Renewal / Reset</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {isPro ? 'Oct 2, 2027 (Auto-renews)' : 'Every midnight (00:00 UTC)'}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices History */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Payment Invoices & Receipts
        </h3>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Invoice ID</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Payment Method</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{inv.amount} INR
                    </td>
                    <td className="py-3 text-slate-500">{inv.paymentMethod}</td>
                    <td className="py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Paid
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Receipt ${inv.invoiceNumber} opened`, 'info')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No invoices yet. Free tier has ₹0 billing.
          </div>
        )}
      </div>
    </div>
  );
};
