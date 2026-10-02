import { ToolId } from './tools';
import { PlanType } from './user';

export interface ToolUsageRecord {
  toolId: ToolId;
  count: number;
}

export interface DailyUsageMap {
  [toolId: string]: number;
}

export interface CheckUsageResult {
  allowed: boolean;
  plan: PlanType;
  usedToday: number;
  limit: number;
  remainingUses: number;
  isUnlimited: boolean;
  message?: string;
}

export interface SystemSettings {
  freeDailyLimitPerTool: number;
  freeMaxFileSizeMB: number;
  proMaxFileSizeMB: number;
  priceMonthlyINR: number;
  priceYearlyINR: number;
  maintenanceMode: boolean;
  announcementBanner: string;
  enabledTools: ToolId[];
}
