export type UserRole = 'user' | 'admin';

export type PlanType = 'free' | 'pro';

export type BillingCycle = 'monthly' | 'yearly';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  plan: PlanType;
  billingCycle?: BillingCycle;
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'none';
  subscriptionId?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  lastLoginAt: string;
  isEmailVerified: boolean;
}

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  tagline: string;
  priceMonthly: number; // in INR (₹)
  priceYearly: number; // in INR (₹)
  dailyToolLimit: number | 'unlimited';
  maxFileSizeMB: number;
  features: string[];
  recommended?: boolean;
}
