import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon: Minimalist document layers with CM monogram and subtle gradient */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-extrabold shadow-md shadow-indigo-500/20`}
      >
        {/* Subtle doc corner fold */}
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-white/20 rounded-bl-sm pointer-events-none" />
        <span className="tracking-tight font-black">CM</span>
      </div>

      <div className="flex flex-col">
        <div className={`font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 ${textSizes[size]}`}>
          <span>CM DocFlow</span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Every document. One simple workflow.
          </span>
        )}
      </div>
    </div>
  );
};
