import { PlanConfig } from '../types/user';

export const PLANS: Record<'free' | 'pro', PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    tagline: 'Ideal for occasional document conversions and light PDF editing.',
    priceMonthly: 0,
    priceYearly: 0,
    dailyToolLimit: 3,
    maxFileSizeMB: 25,
    features: [
      '3 free operations per tool every single day',
      'Access to all 16 PDF and image utilities',
      'Maximum 25 MB file size limit',
      'Client-side instant private processing',
      'Standard processing queue',
      'Personal dashboard & daily usage meter',
      'Automatic daily limit reset at midnight'
    ]
  },
  pro: {
    id: 'pro',
    name: 'CM DocFlow Pro',
    tagline: 'For professionals, businesses, and power users who need unrestricted speed.',
    priceMonthly: 299, // ₹299/mo
    priceYearly: 2499, // ₹2,499/yr (~₹208/mo, save 30%)
    dailyToolLimit: 'unlimited',
    maxFileSizeMB: 100,
    recommended: true,
    features: [
      'Unlimited operations on all 16 tools',
      'No daily tool limits or throttling',
      'Up to 100 MB file size limit',
      'High-speed priority processing',
      'Unlimited batch processing up to 30 files',
      'Full processing history & file re-downloads',
      'Multi-page ZIP exports with 1 click',
      'Advanced document compression engine',
      'Priority 24/7 customer support'
    ]
  }
};

export const PRICING_FAQ = [
  {
    q: 'How does the 3 free daily uses per tool work?',
    a: 'On the Free plan, you receive 3 free conversions per tool every calendar day. For instance, you can use Image to PDF 3 times, Merge PDF 3 times, and PDF Compressor 3 times all on the same day. Limits reset automatically at midnight.'
  },
  {
    q: 'Are my files kept private and secure?',
    a: 'Yes. All file processing occurs either locally in your browser sandbox using WebAssembly/Canvas/pdf-lib, or temporarily in an isolated memory buffer. Your documents are never sold, indexed, or stored permanently.'
  },
  {
    q: 'Which payment methods do you support?',
    a: 'We accept all major Indian and international payment methods via Razorpay, including UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, Mastercard, NetBanking, and Wallets.'
  },
  {
    q: 'Can I cancel or switch my plan anytime?',
    a: 'Yes, you can cancel your subscription anytime directly from your Billing settings with zero penalties or hidden cancellation fees. You retain Pro access until the end of your billing cycle.'
  }
];
