export type ToolCategory = 'pdf' | 'conversion' | 'image';

export type ToolId =
  | 'image-to-pdf'
  | 'word-to-pdf'
  | 'pdf-to-image'
  | 'pdf-compressor'
  | 'merge-pdf'
  | 'split-pdf'
  | 'pdf-page-extractor'
  | 'pdf-to-word'
  | 'image-format-converter'
  | 'image-compressor'
  | 'jpg-to-png'
  | 'png-to-jpg'
  | 'webp-to-jpg'
  | 'jpg-to-webp'
  | 'png-to-webp'
  | 'webp-to-png';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  categoryLabel: string;
  iconName: string;
  path: string;
  acceptedFileTypes: string; // e.g. ".pdf", ".jpg,.png"
  acceptedMimeTypes: string[];
  maxFiles: number;
  badge?: string;
  seoTitle: string;
  seoDescription: string;
}

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'failed';

export interface ProcessingJob {
  id: string;
  userId: string;
  toolId: ToolId;
  inputFileName: string;
  outputFileName: string;
  fileSize: number; // in bytes
  outputFileSize?: number;
  status: 'completed' | 'failed';
  processingTimeMs: number;
  createdAt: string;
  downloadUrl?: string;
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  rotation?: number; // 0, 90, 180, 270
  pageCount?: number;
}
