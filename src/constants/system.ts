import { SystemSettings } from '../types/usage';
import { ALL_TOOLS } from './tools';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  freeDailyLimitPerTool: 3,
  freeMaxFileSizeMB: 25,
  proMaxFileSizeMB: 100,
  priceMonthlyINR: 299,
  priceYearlyINR: 2499,
  maintenanceMode: false,
  announcementBanner: '🚀 New: Batch Image-to-WEBP and Multi-Page PDF Extractor now available with instant conversion!',
  enabledTools: ALL_TOOLS.map((t) => t.id)
};

export const ADMIN_EMAIL_DEFAULT = 'chandramohan.cm.in@gmail.com';
