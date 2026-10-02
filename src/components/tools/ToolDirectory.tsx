import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Zap, FileText, FileImage, Layers, Scissors, Minimize2, RefreshCw } from 'lucide-react';
import { ALL_TOOLS, TOOL_CATEGORIES } from '../../constants/tools';
import { ToolDefinition, ToolCategory } from '../../types/tools';
import { UserProfile } from '../../types/user';
import { getToolUsageCount } from '../../services/usageService';

interface ToolDirectoryProps {
  user: UserProfile | null;
  onSelectTool: (tool: ToolDefinition) => void;
  onOpenUpgrade: () => void;
}

export const ToolDirectory: React.FC<ToolDirectoryProps> = ({ user, onSelectTool, onOpenUpgrade }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = ALL_TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Directory Hero */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>All 16 Document & PDF Utilities</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Tools Directory
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-2 font-normal">
          Select any utility below. Free accounts receive 3 uses per tool every single day.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
          {TOOL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search tools (e.g. compress, merge)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredTools.map((tool) => {
          const usedCount = user ? getToolUsageCount(user.id, tool.id) : 0;
          const isPro = user?.plan === 'pro';

          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer"
            >
              <div>
                {/* Header with icon & badge */}
                <div className="flex items-start justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ToolIcon iconName={tool.iconName} />
                  </div>
                  {tool.badge && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Title & Tagline */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Footer with Usage and CTA */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isPro ? (
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">Unlimited</span>
                  ) : (
                    <span>{3 - Math.min(3, usedCount)} / 3 free left</span>
                  )}
                </span>
                <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Use Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tools found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or filter category.
          </p>
        </div>
      )}
    </div>
  );
};

export const ToolIcon: React.FC<{ iconName: string; className?: string }> = ({
  iconName,
  className = 'w-5 h-5'
}) => {
  switch (iconName) {
    case 'FileImage':
      return <FileImage className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Minimize2':
      return <Minimize2 className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    default:
      return <RefreshCw className={className} />;
  }
};
