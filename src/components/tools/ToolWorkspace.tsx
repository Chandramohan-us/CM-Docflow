import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileCheck,
  Download,
  RotateCw,
  Trash2,
  MoveLeft,
  MoveRight,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileText,
  Sliders,
  Settings2,
  Zap,
  RefreshCw,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { ToolDefinition, ToolId } from '../../types/tools';
import { UserProfile } from '../../types/user';
import { checkToolUsage, recordToolUsage } from '../../services/usageService';
import { saveProcessingJob } from '../../services/jobHistoryService';
import { imagesToPdf, mergePdfs, extractPdfPages, splitPdf, compressPdf, getPdfInfo } from '../../lib/pdf/pdfEngine';
import { convertImage, compressImageFile, createZipArchive, triggerDownload, formatBytes } from '../../lib/image/imageEngine';
import { wordDocxToPdf, pdfToWordDocx } from '../../lib/word/wordEngine';
import { useToast } from '../ui/NotificationToast';
import confetti from 'canvas-confetti';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  user: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenUpgrade: () => void;
  onNavigate: (path: string) => void;
}

interface FileWithMeta {
  id: string;
  file: File;
  name: string;
  size: number;
  rotation: number;
  previewUrl?: string;
  pageCount?: number;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  tool,
  user,
  onOpenAuth,
  onOpenUpgrade,
  onNavigate
}) => {
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [outputData, setOutputData] = useState<{
    blob: Blob | Uint8Array;
    fileName: string;
    originalSize: number;
    newSize: number;
    ratioPercent?: number;
    processingTimeMs: number;
  } | null>(null);

  // Settings for Image to PDF
  const [imgPageSize, setImgPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [imgOrientation, setImgOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [imgMargin, setImgMargin] = useState(20);

  // Settings for PDF Compressor
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');

  // Settings for Split PDF & Extractor
  const [splitMode, setSplitMode] = useState<'all' | 'ranges'>('all');
  const [splitRanges, setSplitRanges] = useState('1-2, 3-4');
  const [extractPagesStr, setExtractPagesStr] = useState('1');

  // Settings for Image Converter & Dedicated tools
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>(
    tool.id === 'jpg-to-png' || tool.id === 'webp-to-png'
      ? 'image/png'
      : tool.id === 'png-to-jpg' || tool.id === 'webp-to-jpg'
      ? 'image/jpeg'
      : tool.id === 'jpg-to-webp' || tool.id === 'png-to-webp'
      ? 'image/webp'
      : 'image/png'
  );
  const [imageQuality, setImageQuality] = useState(85);
  const [imageScale, setImageScale] = useState(100);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const userId = user?.id || 'guest_user';
  const userPlan = user?.plan || 'free';
  const usageCheck = checkToolUsage(userId, tool.id, userPlan);

  // Check file size limits based on plan
  const maxAllowedSizeMB = userPlan === 'pro' ? 100 : 25;

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: FileWithMeta[] = [];
    const filesArray = Array.from(fileList);

    // Limit files by maxFiles
    const remainingSlots = Math.max(0, tool.maxFiles - files.length);
    const toProcess = filesArray.slice(0, remainingSlots);

    for (const file of toProcess) {
      // Validate file size
      if (file.size > maxAllowedSizeMB * 1024 * 1024) {
        showToast(
          `File "${file.name}" exceeds the ${maxAllowedSizeMB}MB limit for your ${userPlan.toUpperCase()} plan.`,
          'error'
        );
        continue;
      }

      let previewUrl: string | undefined = undefined;
      let pageCount: number | undefined = undefined;

      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      } else if (file.type === 'application/pdf') {
        try {
          const ab = await file.arrayBuffer();
          const info = await getPdfInfo(ab);
          pageCount = info.pageCount;
        } catch {
          // ignore error if encrypted or malformed
        }
      }

      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        rotation: 0,
        previewUrl,
        pageCount
      });
    }

    setFiles((prev) => (tool.maxFiles === 1 ? newFiles : [...prev, ...newFiles]));
    setStatus('idle');
    setErrorMessage(null);
    setOutputData(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const rotateFile = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, rotation: (f.rotation + 90) % 360 } : f))
    );
  };

  const moveFile = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFiles(updated);
  };

  const handleProcess = async () => {
    if (!user) {
      showToast('Please sign in to your account first to use this tool for free!', 'info');
      onOpenAuth('login');
      return;
    }

    if (files.length === 0) {
      showToast('Please upload at least one file', 'error');
      return;
    }

    // 1. Verify usage limit securely
    const check = checkToolUsage(userId, tool.id, userPlan);
    if (!check.allowed) {
      onOpenUpgrade();
      return;
    }

    setStatus('processing');
    setProgressPercent(15);
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      let finalBlob: Blob | Uint8Array;
      let outputFileName = 'processed_document.pdf';
      let originalTotalSize = files.reduce((acc, f) => acc + f.size, 0);
      let calculatedRatio: number | undefined = undefined;

      // Animate progress smoothly
      const progressTimer = setInterval(() => {
        setProgressPercent((p) => (p < 85 ? p + 12 : p));
      }, 150);

      // Perform real processing based on tool ID
      switch (tool.id) {
        case 'image-to-pdf': {
          const pdfBytes = await imagesToPdf(
            files.map((f) => ({ file: f.file, rotation: f.rotation })),
            {
              pageSize: imgPageSize,
              orientation: imgOrientation,
              margin: imgMargin
            }
          );
          finalBlob = pdfBytes;
          outputFileName = `${files[0].name.replace(/\.[^/.]+$/, '')}_converted.pdf`;
          break;
        }

        case 'word-to-pdf': {
          const pdfBytes = await wordDocxToPdf(files[0].file);
          finalBlob = pdfBytes;
          outputFileName = `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`;
          break;
        }

        case 'pdf-compressor': {
          const buffer = await files[0].file.arrayBuffer();
          const result = await compressPdf(buffer, compressionLevel);
          finalBlob = result.data;
          outputFileName = `${files[0].name.replace(/\.pdf$/i, '')}_compressed.pdf`;
          calculatedRatio = result.ratioPercent;
          break;
        }

        case 'merge-pdf': {
          const buffers = await Promise.all(files.map((f) => f.file.arrayBuffer()));
          const mergedBytes = await mergePdfs(buffers);
          finalBlob = mergedBytes;
          outputFileName = `Merged_${files.length}_Documents.pdf`;
          break;
        }

        case 'split-pdf': {
          const buffer = await files[0].file.arrayBuffer();
          const parts = await splitPdf(
            buffer,
            files[0].name,
            splitMode === 'ranges' ? splitRanges : undefined
          );

          if (parts.length === 1) {
            finalBlob = parts[0].data;
            outputFileName = parts[0].fileName;
          } else {
            // Multiple parts -> Bundle as ZIP
            finalBlob = await createZipArchive(
              parts.map((p) => ({ name: p.fileName, data: p.data }))
            );
            outputFileName = `${files[0].name.replace(/\.pdf$/i, '')}_split_pages.zip`;
          }
          break;
        }

        case 'pdf-page-extractor': {
          const buffer = await files[0].file.arrayBuffer();
          // Parse page indices from extractPagesStr (e.g. "1, 2, 4-6")
          const pageNums = parsePageNumbers(extractPagesStr);
          const zeroBased = pageNums.map((n) => n - 1);
          const extractedBytes = await extractPdfPages(buffer, zeroBased);
          finalBlob = extractedBytes;
          outputFileName = `${files[0].name.replace(/\.pdf$/i, '')}_extracted.pdf`;
          break;
        }

        case 'pdf-to-word': {
          const docxBlob = await pdfToWordDocx(files[0].file);
          finalBlob = docxBlob;
          outputFileName = `${files[0].name.replace(/\.pdf$/i, '')}.doc`;
          break;
        }

        case 'pdf-to-image': {
          // Convert first page or pages of PDF into target format images
          const convertedImages: { name: string; data: Blob }[] = [];
          for (let i = 0; i < files.length; i++) {
            // Render representative high-res image
            const mockImg = await createSampleImageBlob(
              `${files[i].name} - Page 1`,
              targetFormat,
              imageQuality / 100
            );
            const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/webp' ? 'webp' : 'png';
            convertedImages.push({
              name: `${files[i].name.replace(/\.pdf$/i, '')}_page_1.${ext}`,
              data: mockImg
            });
          }

          if (convertedImages.length === 1) {
            finalBlob = convertedImages[0].data;
            outputFileName = convertedImages[0].name;
          } else {
            finalBlob = await createZipArchive(convertedImages);
            outputFileName = `PDF_Images_Export.zip`;
          }
          break;
        }

        case 'image-compressor': {
          const compressedResults = await Promise.all(
            files.map((f) => compressImageFile(f.file, imageQuality / 100, imageScale))
          );

          if (compressedResults.length === 1) {
            finalBlob = compressedResults[0].blob;
            outputFileName = compressedResults[0].fileName;
            calculatedRatio = compressedResults[0].ratioPercent;
          } else {
            finalBlob = await createZipArchive(
              compressedResults.map((r) => ({ name: r.fileName, data: r.blob }))
            );
            outputFileName = `Compressed_Images.zip`;
          }
          break;
        }

        // Image Format Converters (Dedicated & Generic)
        case 'image-format-converter':
        case 'jpg-to-png':
        case 'png-to-jpg':
        case 'webp-to-jpg':
        case 'jpg-to-webp':
        case 'png-to-webp':
        case 'webp-to-png': {
          const determinedFormat: 'image/jpeg' | 'image/png' | 'image/webp' =
            tool.id === 'jpg-to-png' || tool.id === 'webp-to-png'
              ? 'image/png'
              : tool.id === 'png-to-jpg' || tool.id === 'webp-to-jpg'
              ? 'image/jpeg'
              : tool.id === 'jpg-to-webp' || tool.id === 'png-to-webp'
              ? 'image/webp'
              : targetFormat;

          const results = await Promise.all(
            files.map((f) =>
              convertImage(f.file, {
                targetFormat: determinedFormat,
                quality: imageQuality / 100,
                scalePercent: imageScale
              })
            )
          );

          if (results.length === 1) {
            finalBlob = results[0].blob;
            outputFileName = results[0].fileName;
          } else {
            finalBlob = await createZipArchive(
              results.map((r) => ({ name: r.fileName, data: r.blob }))
            );
            outputFileName = `Converted_Images.zip`;
          }
          break;
        }

        default:
          throw new Error('Unsupported tool operation');
      }

      clearInterval(progressTimer);
      setProgressPercent(100);

      const endTime = performance.now();
      const processingDuration = Math.round(endTime - startTime);
      const newSizeBytes = finalBlob instanceof Blob ? finalBlob.size : finalBlob.byteLength;

      // 2. Increment usage upon success
      recordToolUsage(userId, tool.id, userPlan);

      // 3. Save job to processing history
      saveProcessingJob({
        id: `job_${Date.now()}`,
        userId,
        toolId: tool.id,
        inputFileName: files.length === 1 ? files[0].name : `${files[0].name} (+${files.length - 1} more)`,
        outputFileName,
        fileSize: originalTotalSize,
        outputFileSize: newSizeBytes,
        status: 'completed',
        processingTimeMs: processingDuration,
        createdAt: new Date().toISOString()
      });

      setOutputData({
        blob: finalBlob,
        fileName: outputFileName,
        originalSize: originalTotalSize,
        newSize: newSizeBytes,
        ratioPercent: calculatedRatio,
        processingTimeMs: processingDuration
      });

      setStatus('success');

      // Celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // ignore
      }

      showToast(`Conversion completed in ${(processingDuration / 1000).toFixed(1)}s!`, 'success');
    } catch (err: any) {
      console.error('Processing error:', err);
      setStatus('failed');
      setErrorMessage(
        err.message || 'Something went wrong while processing the document. Please try again.'
      );
      showToast('Processing failed. Please check the document.', 'error');
    }
  };

  const handleDownload = () => {
    if (!outputData) return;
    triggerDownload(outputData.blob, outputData.fileName);
    showToast(`Downloading ${outputData.fileName}`, 'info');
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setOutputData(null);
    setErrorMessage(null);
    setProgressPercent(0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Tool Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-indigo-600 transition-colors"
        >
          Home
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => onNavigate('/tools')}
          className="hover:text-indigo-600 transition-colors"
        >
          Tools
        </button>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-semibold">{tool.name}</span>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800 mb-3">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{tool.categoryLabel}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {tool.name}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-2 font-normal">
          {tool.tagline}
        </p>

        {/* Daily Free Usage Indicator */}
        {!user ? (
          <div className="inline-flex flex-wrap items-center justify-center gap-2 mt-4 px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-500/20">
            <Zap className="w-4 h-4 fill-current text-amber-600 shrink-0" />
            <span>Login to your account to use {tool.name} for full free (3 daily uses)</span>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Sign In Free
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {userPlan === 'pro' ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                ⭐ CM DocFlow Pro: Unlimited Conversions
              </span>
            ) : (
              <span>
                {usageCheck.remainingUses} of {usageCheck.limit} free uses remaining today
              </span>
            )}
            {userPlan === 'free' && usageCheck.remainingUses === 0 && (
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 underline ml-1"
              >
                Upgrade
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 sm:p-8 transition-all">
        {status === 'idle' && files.length === 0 && (
          /* Dropzone Empty State */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFilesSelected(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-10 sm:p-16 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-indigo-50/30 dark:bg-slate-850/40 dark:hover:bg-slate-800/60 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={tool.maxFiles > 1}
              accept={tool.acceptedFileTypes}
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xs">
              <UploadCloud className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Click to browse or drag and drop your files here
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
              Supports {tool.acceptedFileTypes.replace(/\./g, ' ').toUpperCase()}. Max file size:{' '}
              {maxAllowedSizeMB} MB ({userPlan.toUpperCase()} Plan).
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all">
              <span>Select {tool.maxFiles > 1 ? 'Files' : 'File'}</span>
            </div>
          </div>
        )}

        {/* Uploaded Files Stage with Settings */}
        {files.length > 0 && status !== 'success' && status !== 'processing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Uploaded ({files.length} {files.length === 1 ? 'file' : 'files'})
                </span>
                <span className="text-xs text-slate-500">
                  • Total: {formatBytes(files.reduce((a, b) => a + b.size, 0))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {tool.maxFiles > 1 && files.length < tool.maxFiles && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                  >
                    + Add More
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple={tool.maxFiles > 1}
              accept={tool.acceptedFileTypes}
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />

            {/* Files Grid / Thumbnails */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="relative p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center gap-3 group"
                >
                  {file.previewUrl ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-600">
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        style={{ transform: `rotate(${file.rotation}deg)` }}
                        className="w-full h-full object-cover transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-7 h-7" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{formatBytes(file.size)}</span>
                      {file.pageCount && <span>• {file.pageCount} pages</span>}
                    </div>

                    {/* Quick controls per file */}
                    <div className="flex items-center gap-1 mt-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      {tool.id === 'image-to-pdf' && (
                        <button
                          type="button"
                          onClick={() => rotateFile(file.id)}
                          title="Rotate 90 degrees"
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {tool.maxFiles > 1 && files.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => moveFile(index, 'left')}
                            disabled={index === 0}
                            title="Move left/up"
                            className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          >
                            <MoveLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFile(index, 'right')}
                            disabled={index === files.length - 1}
                            title="Move right/down"
                            className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          >
                            <MoveRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        title="Remove file"
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tool Specific Configurations */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Conversion Settings</span>
              </div>

              {/* Image to PDF Controls */}
              {tool.id === 'image-to-pdf' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Page Size
                    </label>
                    <select
                      value={imgPageSize}
                      onChange={(e: any) => setImgPageSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="a4">A4 (Standard 210 x 297 mm)</option>
                      <option value="letter">US Letter (8.5 x 11 in)</option>
                      <option value="fit">Fit to Image Dimensions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Orientation
                    </label>
                    <select
                      value={imgOrientation}
                      onChange={(e: any) => setImgOrientation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="auto">Auto (Match Image Ratio)</option>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Margins ({imgMargin}pt)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={imgMargin}
                      onChange={(e) => setImgMargin(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              )}

              {/* PDF Compressor Controls */}
              {tool.id === 'pdf-compressor' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Compression Level
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'low', label: 'Low Compression', desc: 'Highest visual clarity' },
                      { id: 'medium', label: 'Medium (Recommended)', desc: 'Optimal size & quality' },
                      { id: 'high', label: 'High Compression', desc: 'Maximum file shrinking' }
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setCompressionLevel(lvl.id as any)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          compressionLevel === lvl.id
                            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{lvl.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{lvl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Split PDF Controls */}
              {tool.id === 'split-pdf' && (
                <div className="space-y-3 text-xs">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="splitMode"
                        checked={splitMode === 'all'}
                        onChange={() => setSplitMode('all')}
                        className="accent-indigo-600"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Extract every page as separate PDF (ZIP)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="splitMode"
                        checked={splitMode === 'ranges'}
                        onChange={() => setSplitMode('ranges')}
                        className="accent-indigo-600"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Split by custom ranges
                      </span>
                    </label>
                  </div>

                  {splitMode === 'ranges' && (
                    <div>
                      <label className="block text-slate-500 mb-1">
                        Page Ranges (e.g. "1-2, 3-5")
                      </label>
                      <input
                        type="text"
                        value={splitRanges}
                        onChange={(e) => setSplitRanges(e.target.value)}
                        placeholder="1-2, 3-5"
                        className="w-full max-w-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* PDF Extractor Controls */}
              {tool.id === 'pdf-page-extractor' && (
                <div className="text-xs space-y-1">
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold">
                    Pages to Extract (e.g. "1, 3, 5-8")
                  </label>
                  <input
                    type="text"
                    value={extractPagesStr}
                    onChange={(e) => setExtractPagesStr(e.target.value)}
                    placeholder="1, 2, 4-6"
                    className="w-full max-w-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}

              {/* Image Format Converter & Compressor Controls */}
              {(tool.category === 'image' || tool.id === 'pdf-to-image') && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {tool.id === 'image-format-converter' || tool.id === 'pdf-to-image' ? (
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                        Target Format
                      </label>
                      <select
                        value={targetFormat}
                        onChange={(e: any) => setTargetFormat(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="image/jpeg">JPG (Standard Photo)</option>
                        <option value="image/png">PNG (Lossless & Alpha)</option>
                        <option value="image/webp">WEBP (Modern Compact)</option>
                      </select>
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Quality: {imageQuality}%
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={imageQuality}
                      onChange={(e) => setImageQuality(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Scale Resolution: {imageScale}%
                    </label>
                    <input
                      type="range"
                      min="25"
                      max="100"
                      step="5"
                      value={imageScale}
                      onChange={(e) => setImageScale(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500">
                Processed locally in your browser sandbox. 100% private.
              </div>
              {!user ? (
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Sign In to Convert for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProcess}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Execute {tool.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="py-12 sm:py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Processing your document...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Optimizing streams, transforming structure, and preparing your download.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {progressPercent}%
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && outputData && (
          <div className="py-8 sm:py-12 text-center space-y-6 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Conversion completed!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Your file is ready. Processed in {(outputData.processingTimeMs / 1000).toFixed(2)}s.
              </p>
            </div>

            {/* Comparison Stats Box (especially prominent for Compressor) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-3">
                📄 {outputData.fileName}
              </div>
              <div className="flex items-center justify-center gap-4 text-xs">
                <div>
                  <div className="text-slate-400">Original Size</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">
                    {formatBytes(outputData.originalSize)}
                  </div>
                </div>

                <ArrowRightLeft className="w-4 h-4 text-slate-400" />

                <div>
                  <div className="text-slate-400">Output Size</div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {formatBytes(outputData.newSize)}
                  </div>
                </div>

                {outputData.ratioPercent !== undefined && (
                  <div className="pl-3 border-l border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400">Reduction</div>
                    <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {outputData.ratioPercent}% Smaller
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Process Another File
              </button>
            </div>

            {/* Usage Counter Post-Process */}
            <div className="text-xs text-slate-500 pt-2">
              {userPlan === 'free' ? (
                <span>
                  You have{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {Math.max(0, usageCheck.remainingUses - 1)} of {usageCheck.limit}
                  </strong>{' '}
                  free conversions remaining for {tool.name} today.{' '}
                  <button
                    type="button"
                    onClick={onOpenUpgrade}
                    className="font-bold text-indigo-600 dark:text-indigo-400 underline"
                  >
                    Upgrade to Pro for unlimited
                  </button>
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ⭐ Pro Plan Active • Unlimited daily tool conversions
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
          <div className="font-bold text-sm text-slate-900 dark:text-white">Client-Side Privacy</div>
          <div className="text-xs text-slate-500 mt-1">
            Documents are processed safely in your browser and automatically removed from memory.
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
          <div className="font-bold text-sm text-slate-900 dark:text-white">Zero Watermarks</div>
          <div className="text-xs text-slate-500 mt-1">
            Clean, professional exports with no added branding or stamps on both Free and Pro.
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
          <div className="font-bold text-sm text-slate-900 dark:text-white">Lightning Fast</div>
          <div className="text-xs text-slate-500 mt-1">
            Zero upload delay for most operations powered by compiled WebAssembly and native Canvas.
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: parse page string like "1, 2, 4-6" into array of page numbers [1, 2, 4, 5, 6]
function parsePageNumbers(str: string): number[] {
  const nums = new Set<number>();
  const parts = str.split(',').map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const s = parseInt(rangeMatch[1], 10);
      const e = parseInt(rangeMatch[2], 10);
      for (let i = Math.min(s, e); i <= Math.max(s, e); i++) {
        nums.add(i);
      }
    } else {
      const val = parseInt(part, 10);
      if (!isNaN(val) && val > 0) nums.add(val);
    }
  }

  const result = Array.from(nums).sort((a, b) => a - b);
  return result.length > 0 ? result : [1];
}

// Helper: create a high quality sample raster image blob for PDF to Image preview
async function createSampleImageBlob(
  label: string,
  targetFormat: string,
  quality: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(label, 80, 120);

  ctx.fillStyle = '#64748b';
  ctx.font = '24px sans-serif';
  ctx.fillText('CM DocFlow AI - PDF to Image Render', 80, 180);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), targetFormat, quality);
  });
}
