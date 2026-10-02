import React from 'react';
import { Logo } from './Logo';
import { Shield, Lock, FileCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <button type="button" onClick={() => onNavigate('/')} className="focus:outline-none">
              <Logo size="md" showTagline={true} />
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              CM DocFlow AI is a modern high-performance document utility platform. Convert, compress, merge, split, and transform PDF and image files with browser-native privacy and maximum speed.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" />
                <span>Zero File Retention • Browser-Sandboxed</span>
              </div>
            </div>
          </div>

          {/* PDF Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Popular Tools
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'Image to PDF', path: '/tools/image-to-pdf' },
                { name: 'PDF Compressor', path: '/tools/pdf-compressor' },
                { name: 'Merge PDF', path: '/tools/merge-pdf' },
                { name: 'Split PDF', path: '/tools/split-pdf' },
                { name: 'PDF to Image', path: '/tools/pdf-to-image' },
                { name: 'PDF to Word', path: '/tools/pdf-to-word' }
              ].map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Image & Conversion */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Image Utilities
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'Image Converter', path: '/tools/image-format-converter' },
                { name: 'Image Compressor', path: '/tools/image-compressor' },
                { name: 'JPG to PNG', path: '/tools/jpg-to-png' },
                { name: 'PNG to JPG', path: '/tools/png-to-jpg' },
                { name: 'WEBP to JPG', path: '/tools/webp-to-jpg' },
                { name: 'JPG to WEBP', path: '/tools/jpg-to-webp' }
              ].map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Product & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Product & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  All 16 Tools
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/pricing')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Pricing & Plans
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/terms')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/cookies')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} CM DocFlow AI. Designed with high-performance WebAssembly and client-side processing.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span>TLS 1.3 End-to-End Encryption</span>
            </span>
            <span>•</span>
            <span>Made for speed & privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
