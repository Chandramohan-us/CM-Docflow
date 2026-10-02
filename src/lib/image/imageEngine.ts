import JSZip from 'jszip';

export interface ImageConversionOptions {
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number; // 0.1 to 1.0
  scalePercent?: number; // 10 to 100
  backgroundColor?: string; // for png to jpg transparency fill, default #ffffff
}

export async function convertImage(
  file: File,
  options: ImageConversionOptions
): Promise<{ blob: Blob; fileName: string; originalSize: number; newSize: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const originalW = img.naturalWidth || img.width;
      const originalH = img.naturalHeight || img.height;

      const scale = (options.scalePercent || 100) / 100;
      const targetW = Math.max(1, Math.round(originalW * scale));
      const targetH = Math.max(1, Math.round(originalH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // If converting to JPEG, fill canvas with white background so transparent alpha isn't black
      if (options.targetFormat === 'image/jpeg') {
        ctx.fillStyle = options.backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // High quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }

          // Generate target filename
          const ext =
            options.targetFormat === 'image/jpeg'
              ? 'jpg'
              : options.targetFormat === 'image/png'
              ? 'png'
              : 'webp';

          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const outputName = `${baseName}.${ext}`;

          resolve({
            blob,
            fileName: outputName,
            originalSize: file.size,
            newSize: blob.size
          });
        },
        options.targetFormat,
        options.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image "${file.name}". The format may be corrupted.`));
    };

    img.src = url;
  });
}

/**
 * Intelligent Image Compressor
 */
export async function compressImageFile(
  file: File,
  quality: number = 0.75,
  scalePercent: number = 100
): Promise<{ blob: Blob; fileName: string; originalSize: number; newSize: number; ratioPercent: number }> {
  const mime = file.type || 'image/jpeg';
  const targetMime: 'image/jpeg' | 'image/png' | 'image/webp' =
    mime.includes('webp') ? 'image/webp' : mime.includes('png') ? 'image/png' : 'image/jpeg';

  const result = await convertImage(file, {
    targetFormat: targetMime,
    quality,
    scalePercent
  });

  const savedBytes = Math.max(0, result.originalSize - result.newSize);
  const ratioPercent = Math.min(95, Math.max(5, Math.round((savedBytes / result.originalSize) * 100)));

  return {
    ...result,
    ratioPercent
  };
}

/**
 * Create a ZIP archive from multiple output files
 */
export async function createZipArchive(
  items: { name: string; data: Blob | Uint8Array }[]
): Promise<Blob> {
  const zip = new JSZip();

  items.forEach((item) => {
    zip.file(item.name, item.data);
  });

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

/**
 * Trigger browser file download
 */
export function triggerDownload(data: Blob | Uint8Array, fileName: string) {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Format bytes nicely (e.g., 2.4 MB, 450 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
