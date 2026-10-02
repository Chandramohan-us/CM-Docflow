import React from 'react';
import { ArrowLeft, Shield, Lock, FileCheck } from 'lucide-react';

interface LegalPageProps {
  page: 'privacy' | 'terms' | 'cookies';
  onNavigate: (path: string) => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ page, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Home</span>
      </button>

      {page === 'privacy' && (
        <article className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-xs">Last updated: October 2026</p>

          <p>
            At <strong>CM DocFlow AI</strong> ("we", "us", or "our"), privacy and document integrity are central to our product architecture. This Privacy Policy details how we handle files, account details, and diagnostic data when you use our document conversion and PDF processing platform.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            1. Client-Side Document Processing & Retention
          </h3>
          <p>
            The majority of our utilities (including Image to PDF, Merge PDF, Split PDF, Image Compression, and Format Conversion) operate <strong>locally inside your browser sandbox</strong> via client-side WebAssembly, Canvas rendering, and JavaScript execution. In these operations, your documents never touch external cloud servers.
          </p>
          <p>
            For complex conversions requiring backend synthesis, documents are stored solely in volatile RAM memory buffers during the conversion request and are automatically purged upon session completion. We do not permanently index, archive, or mine the contents of your documents.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            2. Account & Usage Information
          </h3>
          <p>
            When you register, we collect basic account metadata (name, email address, profile picture). We store daily tool usage counters to enforce our fair-use freemium policy (3 free uses per tool per day) and processing history audit logs for your convenience.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            3. Payment Processing
          </h3>
          <p>
            Payment transactions for Pro subscriptions are handled securely through certified gateways such as Razorpay. We do not store full credit card numbers or banking secrets on our servers.
          </p>
        </article>
      )}

      {page === 'terms' && (
        <article className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-500 text-xs">Last updated: October 2026</p>

          <p>
            By accessing or using <strong>CM DocFlow AI</strong>, you agree to comply with and be bound by these Terms of Service.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            1. Use of Services & Freemium Quotas
          </h3>
          <p>
            Free tier users are entitled to 3 free operations per tool per calendar day. Free quotas automatically reset at midnight. Any attempt to circumvent daily limits through automation, scraping, or state falsification is strictly prohibited.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            2. Pro Subscription & Billing
          </h3>
          <p>
            Pro plans unlock unlimited daily conversions, 100MB file thresholds, and batch processing. Subscriptions renew automatically unless cancelled prior to the billing cycle expiration date.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
            3. User Responsibility
          </h3>
          <p>
            You retain all ownership rights to the files you convert. You agree not to upload content that violates intellectual property laws, contains malware, or contains illegal materials.
          </p>
        </article>
      )}

      {page === 'cookies' && (
        <article className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Cookie Policy
          </h1>
          <p className="text-slate-500 text-xs">Last updated: October 2026</p>

          <p>
            We use strictly essential local storage and session cookies to persist your theme preference, authentication tokens, and daily usage counters across page refreshes.
          </p>
          <p>
            We do not employ intrusive cross-site third-party advertising trackers.
          </p>
        </article>
      )}
    </div>
  );
};
