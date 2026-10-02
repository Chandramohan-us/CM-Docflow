import React, { useState } from 'react';
import {
  ArrowRight,
  Shield,
  Zap,
  Check,
  Sparkles,
  FileText,
  Layers,
  Scissors,
  Minimize2,
  RefreshCw,
  FileImage,
  Lock,
  HardDrive,
  Users,
  ChevronRight,
  Star
} from 'lucide-react';
import { ALL_TOOLS } from '../../constants/tools';
import { PLANS, PRICING_FAQ } from '../../constants/plans';
import { UserProfile, BillingCycle } from '../../types/user';
import { ToolDefinition } from '../../types/tools';

interface LandingPageProps {
  user: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenUpgrade: () => void;
  onSelectTool: (tool: ToolDefinition) => void;
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  user,
  onOpenAuth,
  onOpenUpgrade,
  onSelectTool,
  onNavigate
}) => {
  const [pricingCycle, setPricingCycle] = useState<BillingCycle>('yearly');

  const popularTools = ALL_TOOLS.slice(0, 6);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs mb-6 animate-in fade-in duration-300">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
            <span>Next-Gen Document Utilities & PDF Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Every document.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              One simple workflow.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 mt-6 max-w-2xl mx-auto font-normal leading-relaxed">
            Convert, compress, merge, split and transform your documents with fast, simple and secure online tools. 3 free daily operations per tool.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {user ? (
              <button
                type="button"
                onClick={() => onNavigate('/dashboard')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Start for Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('/tools')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 font-bold text-sm transition-all cursor-pointer backdrop-blur-sm"
            >
              <span>Explore All 16 Tools</span>
            </button>
          </div>

          {/* Hero Visual Mockup */}
          <div className="mt-14 sm:mt-18 relative max-w-4xl mx-auto">
            <div className="relative rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-slate-200/60 to-slate-100/30 dark:from-slate-800/80 dark:to-slate-900/40 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-md">
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/80 text-left">
                {/* Mockup Header Bar */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-xs font-mono font-medium text-slate-400">
                      cmflow.ai / workspace / processing
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Browser Sandbox Active</span>
                  </div>
                </div>

                {/* Floating Mockup Tool Cards */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      name: 'Image to PDF',
                      desc: '4 files ready to compile',
                      icon: <FileImage className="w-5 h-5 text-indigo-500" />,
                      status: 'Converted in 0.8s',
                      toolId: 'image-to-pdf'
                    },
                    {
                      name: 'PDF Compressor',
                      desc: '12.4 MB → 4.1 MB',
                      icon: <Minimize2 className="w-5 h-5 text-emerald-500" />,
                      status: '67% smaller',
                      toolId: 'pdf-compressor'
                    },
                    {
                      name: 'Merge PDF',
                      desc: '3 documents sequenced',
                      icon: <Layers className="w-5 h-5 text-blue-500" />,
                      status: 'Merged & verified',
                      toolId: 'merge-pdf'
                    },
                    {
                      name: 'PDF to Image',
                      desc: 'Page 1-12 high DPI',
                      icon: <Scissors className="w-5 h-5 text-amber-500" />,
                      status: 'ZIP ready',
                      toolId: 'pdf-to-image'
                    }
                  ].map((card, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const target = ALL_TOOLS.find((t) => t.id === card.toolId);
                        if (target) onSelectTool(target);
                      }}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500 transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center mb-2.5">
                        {card.icon}
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                        {card.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{card.desc}</div>
                      <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                        <span>{card.status}</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Benefits Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 rounded-3xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">16 Tools</div>
            <div className="text-xs font-semibold text-slate-500">PDF, Word & Image Utilities</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">3 Uses/Tool</div>
            <div className="text-xs font-semibold text-slate-500">Free Every Single Day</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">0% Wait</div>
            <div className="text-xs font-semibold text-slate-500">Instant Local Processing</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">100% Private</div>
            <div className="text-xs font-semibold text-slate-500">Zero Server Data Leak</div>
          </div>
        </div>
      </section>

      {/* 3. Popular Tools Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              Engineered For Speed
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Essential Document Utilities
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/tools')}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View All 16 Utilities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {tool.iconName === 'FileImage' ? (
                      <FileImage className="w-6 h-6" />
                    ) : tool.iconName === 'FileText' ? (
                      <FileText className="w-6 h-6" />
                    ) : tool.iconName === 'Minimize2' ? (
                      <Minimize2 className="w-6 h-6" />
                    ) : tool.iconName === 'Layers' ? (
                      <Layers className="w-6 h-6" />
                    ) : tool.iconName === 'Scissors' ? (
                      <Scissors className="w-6 h-6" />
                    ) : (
                      <RefreshCw className="w-6 h-6" />
                    )}
                  </div>
                  {tool.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">3 free uses/day</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works (1. Upload -> 2. Process -> 3. Download) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            Workflow Architecture
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How CM DocFlow AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Engineered from the ground up for frictionless document workflows in three effortless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Upload Document',
              desc: 'Drag & drop single or multiple files directly from your computer or mobile device. Files never leave your browser sandbox unless server synthesis is strictly required.'
            },
            {
              step: '02',
              title: 'Fine-Tune & Convert',
              desc: 'Adjust compression levels, page orientations, margins, reorder pages, or select target formats with real-time feedback and high-performance WebAssembly.'
            },
            {
              step: '03',
              title: 'Instant Download',
              desc: 'Retrieve your crystal-clear converted PDF, editable Word document, or lightweight compressed images individually or as a single consolidated ZIP archive.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative"
            >
              <div className="text-3xl sm:text-4xl font-black text-indigo-600/30 dark:text-indigo-400/20 font-mono mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Pricing Section (Free vs Pro comparison) */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            Transparent Pricing
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Simple, honest plans for everyone
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Start completely free with 3 daily uses per tool. Upgrade to Pro for unrestricted speed.
          </p>

          {/* Monthly / Yearly Switch */}
          <div className="flex items-center justify-center mt-6">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setPricingCycle('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  pricingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setPricingCycle('yearly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pricingCycle === 'yearly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Yearly Billing</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  SAVE 30%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-500">Free Plan</div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {PLANS.free.tagline}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
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
              onClick={() => onOpenAuth('signup')}
              className="mt-8 w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Plan Card */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-slate-900 border-2 border-indigo-600 shadow-xl flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md">
              Most Popular
            </div>

            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                CM DocFlow Pro
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  ₹{pricingCycle === 'yearly' ? PLANS.pro.priceYearly : PLANS.pro.priceMonthly}
                </span>
                <span className="text-xs text-slate-500">
                  {pricingCycle === 'yearly' ? '/ year (save ₹1,089)' : '/ month'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {PLANS.pro.tagline}
              </p>

              <div className="mt-6 pt-6 border-t border-indigo-100 dark:border-indigo-900/50 space-y-3">
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
              Upgrade to Pro (Razorpay)
            </button>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            Questions Answered
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {PRICING_FAQ.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{faq.q}</h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Final High-Impact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white text-center overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to streamline every document?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-normal">
              Join thousands of professionals, freelancers, and businesses who transform documents securely in seconds with CM DocFlow AI.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => (user ? onNavigate('/tools') : onOpenAuth('signup'))}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-indigo-600 font-bold text-xs shadow-lg hover:bg-blue-50 transition-all cursor-pointer"
              >
                {user ? 'Browse All Tools' : 'Start Converting Free'}
              </button>
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-900/40 hover:bg-indigo-900/60 text-white border border-white/20 font-bold text-xs transition-all cursor-pointer"
              >
                Explore Pro Features
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
