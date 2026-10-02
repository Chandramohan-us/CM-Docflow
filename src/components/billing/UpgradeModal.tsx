import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Shield, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PLANS } from '../../constants/plans';
import { UserProfile, BillingCycle } from '../../types/user';
import { processRazorpayCheckout } from '../../services/subscriptionService';
import { useToast } from '../ui/NotificationToast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpgradeSuccess: (updatedUser: UserProfile) => void;
  sourceToolName?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgradeSuccess,
  sourceToolName
}) => {
  const [cycle, setCycle] = useState<BillingCycle>('yearly');
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'plan' | 'razorpay' | 'success'>('plan');
  const { showToast } = useToast();

  if (!isOpen) return null;

  const proPlan = PLANS.pro;
  const currentPrice = cycle === 'yearly' ? proPlan.priceYearly : proPlan.priceMonthly;
  const monthlyEquivalent = cycle === 'yearly' ? Math.round(proPlan.priceYearly / 12) : proPlan.priceMonthly;

  const handleStartRazorpay = () => {
    setPaymentStep('razorpay');
  };

  const handleConfirmPayment = async () => {
    setProcessing(true);
    try {
      const response = await processRazorpayCheckout(user, 'pro', cycle, currentPrice);
      if (response.success) {
        setProcessing(false);
        setPaymentStep('success');

        // Fire celebratory confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

        showToast('🎉 Welcome to CM DocFlow Pro! Unlimited access activated.', 'success');
        setTimeout(() => {
          onUpgradeSuccess({
            ...user,
            plan: 'pro',
            subscriptionStatus: 'active',
            billingCycle: cycle
          });
          onClose();
        }, 2200);
      }
    } catch {
      setProcessing(false);
      showToast('Payment could not be completed. Please try again.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentStep === 'plan' && (
          <div>
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20 mb-3">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Daily Limit Reached</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              You've used all 3 free conversions for today{sourceToolName ? ` on ${sourceToolName}` : ''}.
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Upgrade to <span className="font-semibold text-indigo-600 dark:text-indigo-400">CM DocFlow Pro</span> for unlimited daily conversions, 100MB file limits, batch conversions, and lightning-fast priority processing.
            </p>

            {/* Monthly vs Yearly Switcher */}
            <div className="flex items-center justify-center my-6">
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCycle('monthly')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    cycle === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly (₹299/mo)
                </button>
                <button
                  type="button"
                  onClick={() => setCycle('yearly')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    cycle === 'yearly'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Yearly (₹2,499/yr)</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                    SAVE 30%
                  </span>
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/30 dark:to-slate-800/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between mb-5">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  Pro Plan ({cycle === 'yearly' ? 'Billed Annually' : 'Billed Monthly'})
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ₹{cycle === 'yearly' ? '2,499' : '299'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {cycle === 'yearly' ? `(just ₹${monthlyEquivalent}/month)` : '/month'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs">
                  Unlimited Access
                </span>
                <div className="text-[11px] text-slate-400 mt-1">Cancel anytime</div>
              </div>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 text-xs">
              {[
                'Unlimited tool conversions 24/7',
                '100 MB max file size (4x Free limit)',
                'Batch upload up to 30 files',
                'Zero daily tool throttling',
                'Multi-page ZIP batch exports',
                'Full history & file recovery'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleStartRazorpay}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Upgrade to Pro Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-all cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {paymentStep === 'razorpay' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                R
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Razorpay Checkout
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  CM DocFlow AI Pro Subscription
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400">Selected Plan:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  CM DocFlow Pro ({cycle === 'yearly' ? '1 Year' : '1 Month'})
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400">Total Payable:</span>
                <span className="font-extrabold text-lg text-indigo-600 dark:text-indigo-400">
                  ₹{currentPrice} INR
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Payment methods supported: UPI (Google Pay, PhonePe, Paytm), RuPay/Visa/Mastercard, NetBanking.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                256-Bit SSL Encrypted & Razorpay PCI-DSS Level 1 Certified Gateway.
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {processing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Verifying with Razorpay...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{currentPrice} via Razorpay</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setPaymentStep('plan')}
                disabled={processing}
                className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              Payment Successful!
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your account has been upgraded to <strong>CM DocFlow Pro</strong>. All tool limits have been unlocked!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
