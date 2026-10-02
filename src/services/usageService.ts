import { ToolId } from '../types/tools';
import { PlanType } from '../types/user';
import { CheckUsageResult, DailyUsageMap } from '../types/usage';
import { DEFAULT_SYSTEM_SETTINGS } from '../constants/system';

const USAGE_STORAGE_KEY = 'cm_docflow_daily_usage';

function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface StoredUsagePayload {
  [userId: string]: {
    date: string;
    tools: { [toolId: string]: number };
  };
}

function loadAllUsage(): StoredUsagePayload {
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllUsage(payload: StoredUsagePayload) {
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to persist usage', e);
  }
}

/**
 * Checks whether user can run the specified tool.
 * FREE PLAN: 3 uses per tool per day.
 * PRO PLAN: Unlimited.
 */
export function checkToolUsage(userId: string, toolId: ToolId, userPlan: PlanType): CheckUsageResult {
  const isUnlimited = userPlan === 'pro';
  const limit = isUnlimited ? Infinity : DEFAULT_SYSTEM_SETTINGS.freeDailyLimitPerTool;

  if (isUnlimited) {
    return {
      allowed: true,
      plan: 'pro',
      usedToday: getToolUsageCount(userId, toolId),
      limit: 999999,
      remainingUses: 999999,
      isUnlimited: true
    };
  }

  const used = getToolUsageCount(userId, toolId);
  const remaining = Math.max(0, limit - used);
  const allowed = remaining > 0;

  return {
    allowed,
    plan: 'free',
    usedToday: used,
    limit,
    remainingUses: remaining,
    isUnlimited: false,
    message: allowed
      ? `${remaining} of ${limit} free uses remaining today.`
      : `You've reached your daily limit of ${limit} free uses for this tool.`
  };
}

/**
 * Retrieves today's usage count for a given tool
 */
export function getToolUsageCount(userId: string, toolId: ToolId): number {
  const all = loadAllUsage();
  const today = getTodayKey();
  const userRecord = all[userId];

  if (!userRecord || userRecord.date !== today) {
    return 0;
  }

  return userRecord.tools[toolId] || 0;
}

/**
 * Records successful tool completion and increments counter
 */
export function recordToolUsage(userId: string, toolId: ToolId, userPlan: PlanType): void {
  // We still record count even for Pro for personal analytics
  const all = loadAllUsage();
  const today = getTodayKey();

  if (!all[userId] || all[userId].date !== today) {
    all[userId] = {
      date: today,
      tools: {}
    };
  }

  const current = all[userId].tools[toolId] || 0;
  all[userId].tools[toolId] = current + 1;
  saveAllUsage(all);

  // Dispatch custom event for reactive UI updates across dashboard/navbar
  window.dispatchEvent(new CustomEvent('cm_usage_updated', { detail: { toolId, count: current + 1 } }));
}

/**
 * Get full summary of today's tool usage for user
 */
export function getTodayUsageSummary(userId: string): DailyUsageMap {
  const all = loadAllUsage();
  const today = getTodayKey();
  const userRecord = all[userId];

  if (!userRecord || userRecord.date !== today) {
    return {};
  }

  return { ...userRecord.tools };
}

/**
 * Reset usage (Admin or testing purpose)
 */
export function resetUserUsage(userId: string): void {
  const all = loadAllUsage();
  delete all[userId];
  saveAllUsage(all);
  window.dispatchEvent(new CustomEvent('cm_usage_updated', { detail: {} }));
}
