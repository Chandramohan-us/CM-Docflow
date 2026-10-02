import { ProcessingJob, ToolId } from '../types/tools';

const JOBS_STORAGE_KEY = 'cm_docflow_jobs';

export function getStoredJobs(userId: string): ProcessingJob[] {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!raw) return getDefaultDemoJobs(userId);
    const all: ProcessingJob[] = JSON.parse(raw);
    return all.filter((j) => j.userId === userId);
  } catch {
    return getDefaultDemoJobs(userId);
  }
}

export function saveProcessingJob(job: ProcessingJob): void {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    const all: ProcessingJob[] = raw ? JSON.parse(raw) : getDefaultDemoJobs(job.userId);
    all.unshift(job);
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('cm_jobs_updated', { detail: job }));
  } catch (e) {
    console.error('Failed to save processing job', e);
  }
}

export function deleteProcessingJob(jobId: string, userId: string): void {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    const all: ProcessingJob[] = raw ? JSON.parse(raw) : getDefaultDemoJobs(userId);
    const filtered = all.filter((j) => j.id !== jobId);
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('cm_jobs_updated', { detail: { deleted: jobId } }));
  } catch (e) {
    console.error('Failed to delete job', e);
  }
}

export function clearAllJobs(userId: string): void {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    const all: ProcessingJob[] = raw ? JSON.parse(raw) : [];
    const remaining = all.filter((j) => j.userId !== userId);
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent('cm_jobs_updated', { detail: { cleared: true } }));
  } catch (e) {
    console.error('Failed to clear jobs', e);
  }
}

function getDefaultDemoJobs(userId: string): ProcessingJob[] {
  return [
    {
      id: 'job_001',
      userId,
      toolId: 'image-to-pdf',
      inputFileName: 'Tax_Receipts_2026.jpg',
      outputFileName: 'Tax_Receipts_2026.pdf',
      fileSize: 4210000,
      outputFileSize: 3890000,
      status: 'completed',
      processingTimeMs: 1250,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'job_002',
      userId,
      toolId: 'pdf-compressor',
      inputFileName: 'Q3_Financial_Presentation.pdf',
      outputFileName: 'Q3_Financial_Presentation_compressed.pdf',
      fileSize: 14800000,
      outputFileSize: 4320000,
      status: 'completed',
      processingTimeMs: 2400,
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 'job_003',
      userId,
      toolId: 'merge-pdf',
      inputFileName: 'Contract_Agreements_4_Files.pdf',
      outputFileName: 'Merged_Contract_2026.pdf',
      fileSize: 8900000,
      outputFileSize: 8850000,
      status: 'completed',
      processingTimeMs: 1800,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
}
