import React, { useState, useEffect } from 'react';
import { Search, Trash2, Download, History, FileText, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../../types/user';
import { ProcessingJob } from '../../types/tools';
import { getStoredJobs, deleteProcessingJob, clearAllJobs } from '../../services/jobHistoryService';
import { formatBytes } from '../../lib/image/imageEngine';
import { useToast } from '../ui/NotificationToast';

interface ProcessingHistoryProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export const ProcessingHistory: React.FC<ProcessingHistoryProps> = ({ user, onNavigate }) => {
  const [jobs, setJobs] = useState<ProcessingJob[]>(getStoredJobs(user.id));
  const [search, setSearch] = useState('');
  const [filterTool, setFilterTool] = useState('all');
  const { showToast } = useToast();

  useEffect(() => {
    const handleUpdate = () => {
      setJobs(getStoredJobs(user.id));
    };
    window.addEventListener('cm_jobs_updated', handleUpdate);
    return () => window.removeEventListener('cm_jobs_updated', handleUpdate);
  }, [user]);

  const handleDelete = (id: string) => {
    deleteProcessingJob(id, user.id);
    showToast('Record deleted from history', 'info');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all processing history?')) {
      clearAllJobs(user.id);
      showToast('All processing history cleared', 'info');
    }
  };

  const filtered = jobs.filter((j) => {
    const matchesSearch =
      j.inputFileName.toLowerCase().includes(search.toLowerCase()) ||
      j.outputFileName.toLowerCase().includes(search.toLowerCase()) ||
      j.toolId.toLowerCase().includes(search.toLowerCase());
    const matchesTool = filterTool === 'all' || j.toolId === filterTool;
    return matchesSearch && matchesTool;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Processing History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit logs of all your document conversions and compression operations.
          </p>
        </div>

        {jobs.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors self-start"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by file name or tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={filterTool}
          onChange={(e) => setFilterTool(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="all">All Tools</option>
          <option value="image-to-pdf">Image to PDF</option>
          <option value="pdf-compressor">PDF Compressor</option>
          <option value="merge-pdf">Merge PDF</option>
          <option value="split-pdf">Split PDF</option>
          <option value="word-to-pdf">Word to PDF</option>
          <option value="image-format-converter">Image Converter</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Output File</th>
                  <th className="py-3.5 px-4">Tool</th>
                  <th className="py-3.5 px-4">Original Size</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Processed Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2 max-w-[240px] truncate">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{job.outputFileName || job.inputFileName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-600 dark:text-slate-300">
                      {job.toolId.replace(/-/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {formatBytes(job.fileSize)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {(job.processingTimeMs / 1000).toFixed(2)}s
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(job.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs">
            No processing records match your current filters.
          </div>
        )}
      </div>
    </div>
  );
};
