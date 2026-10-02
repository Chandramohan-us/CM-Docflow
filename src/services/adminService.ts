import { SystemSettings } from '../types/usage';
import { UserProfile } from '../types/user';
import { DEFAULT_SYSTEM_SETTINGS } from '../constants/system';
import { DEMO_USERS } from './authService';

const ADMIN_SETTINGS_KEY = 'cm_docflow_admin_settings';
const ADMIN_USERS_KEY = 'cm_docflow_admin_users';

export interface AdminAnalyticsData {
  totalUsers: number;
  activeUsersToday: number;
  freeUsers: number;
  proUsers: number;
  totalConversions: number;
  conversionsToday: number;
  successRate: number; // 99.4%
  totalRevenueINR: number;
  mrrINR: number;
  conversionGrowth: { date: string; conversions: number; free: number; pro: number }[];
  revenueGrowth: { month: string; revenue: number }[];
  toolPopularity: { name: string; uses: number; share: number }[];
}

export function getSystemSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SYSTEM_SETTINGS;
  } catch {
    return DEFAULT_SYSTEM_SETTINGS;
  }
}

export function saveSystemSettings(settings: SystemSettings): void {
  try {
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('cm_settings_updated', { detail: settings }));
  } catch (e) {
    console.error('Failed to save system settings', e);
  }
}

export function getAdminUsersList(): (UserProfile & { isSuspended?: boolean; totalConversions?: number })[] {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  const initialList = [
    { ...DEMO_USERS[0], totalConversions: 42, isSuspended: false },
    { ...DEMO_USERS[1], totalConversions: 8, isSuspended: false },
    { ...DEMO_USERS[2], totalConversions: 95, isSuspended: false },
    {
      id: 'user_004',
      email: 'rohit.sharma@enterprise.in',
      name: 'Rohit Sharma',
      role: 'user' as const,
      plan: 'pro' as const,
      subscriptionStatus: 'active' as const,
      billingCycle: 'yearly' as const,
      createdAt: '2026-02-14T08:00:00.000Z',
      lastLoginAt: '2026-10-01T15:20:00.000Z',
      isEmailVerified: true,
      totalConversions: 168,
      isSuspended: false
    },
    {
      id: 'user_005',
      email: 'priya.nair@startup.co',
      name: 'Priya Nair',
      role: 'user' as const,
      plan: 'free' as const,
      subscriptionStatus: 'none' as const,
      createdAt: '2026-03-12T11:45:00.000Z',
      lastLoginAt: '2026-10-02T01:10:00.000Z',
      isEmailVerified: true,
      totalConversions: 14,
      isSuspended: false
    }
  ];

  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(initialList));
  return initialList;
}

export function updateAdminUser(
  userId: string,
  updates: Partial<UserProfile & { isSuspended?: boolean }>
): void {
  const users = getAdminUsersList();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
  }
}

export function getAdminAnalytics(): AdminAnalyticsData {
  return {
    totalUsers: 2840,
    activeUsersToday: 412,
    freeUsers: 2190,
    proUsers: 650,
    totalConversions: 18450,
    conversionsToday: 842,
    successRate: 99.4,
    totalRevenueINR: 194350,
    mrrINR: 194350,
    conversionGrowth: [
      { date: 'Mon', conversions: 620, free: 440, pro: 180 },
      { date: 'Tue', conversions: 710, free: 490, pro: 220 },
      { date: 'Wed', conversions: 890, free: 600, pro: 290 },
      { date: 'Thu', conversions: 810, free: 540, pro: 270 },
      { date: 'Fri', conversions: 940, free: 620, pro: 320 },
      { date: 'Sat', conversions: 780, free: 530, pro: 250 },
      { date: 'Sun', conversions: 842, free: 560, pro: 282 }
    ],
    revenueGrowth: [
      { month: 'May', revenue: 98000 },
      { month: 'Jun', revenue: 114000 },
      { month: 'Jul', revenue: 138000 },
      { month: 'Aug', revenue: 156000 },
      { month: 'Sep', revenue: 178000 },
      { month: 'Oct', revenue: 194350 }
    ],
    toolPopularity: [
      { name: 'Image to PDF', uses: 5120, share: 28 },
      { name: 'PDF Compressor', uses: 4210, share: 23 },
      { name: 'Merge PDF', uses: 3680, share: 20 },
      { name: 'PDF to Image', uses: 2420, share: 13 },
      { name: 'Image Converter', uses: 1720, share: 9 },
      { name: 'Split PDF', uses: 1300, share: 7 }
    ]
  };
}
