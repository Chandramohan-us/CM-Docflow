import { UserProfile, PlanType, UserRole } from '../types/user';
import { ADMIN_EMAIL_DEFAULT } from '../constants/system';

const AUTH_USER_KEY = 'cm_docflow_auth_user';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user_admin_001',
    email: ADMIN_EMAIL_DEFAULT,
    name: 'Chandra Mohan (Admin)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    plan: 'pro',
    subscriptionStatus: 'active',
    billingCycle: 'yearly',
    createdAt: '2026-01-15T10:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    isEmailVerified: true
  },
  {
    id: 'user_free_002',
    email: 'alex.starter@example.com',
    name: 'Alex Starter',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    plan: 'free',
    subscriptionStatus: 'none',
    createdAt: '2026-03-01T12:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    isEmailVerified: true
  },
  {
    id: 'user_pro_003',
    email: 'sarah.pro@example.com',
    name: 'Sarah Jenkins',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    plan: 'pro',
    subscriptionStatus: 'active',
    billingCycle: 'monthly',
    createdAt: '2026-02-10T14:30:00.000Z',
    lastLoginAt: new Date().toISOString(),
    isEmailVerified: true
  }
];

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user', e);
  }
  return null;
}

export function saveStoredUser(user: UserProfile | null) {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to save user', e);
  }
}

export async function loginWithEmail(email: string): Promise<UserProfile> {
  // Check if matches known demo accounts
  const match = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (match) {
    const user: UserProfile = { ...match, lastLoginAt: new Date().toISOString() };
    saveStoredUser(user);
    return user;
  }

  // Create new user profile
  const isAdmin = email.toLowerCase() === ADMIN_EMAIL_DEFAULT.toLowerCase();
  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    email,
    name: email.split('@')[0].replace('.', ' '),
    role: isAdmin ? 'admin' : 'user',
    plan: isAdmin ? 'pro' : 'free',
    subscriptionStatus: isAdmin ? 'active' : 'none',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isEmailVerified: true
  };
  saveStoredUser(newUser);
  return newUser;
}

export async function signupWithEmail(email: string, name: string): Promise<UserProfile> {
  const isAdmin = email.toLowerCase() === ADMIN_EMAIL_DEFAULT.toLowerCase();
  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    email,
    name: name || email.split('@')[0],
    role: isAdmin ? 'admin' : 'user',
    plan: isAdmin ? 'pro' : 'free',
    subscriptionStatus: isAdmin ? 'active' : 'none',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isEmailVerified: true
  };
  saveStoredUser(newUser);
  return newUser;
}

export async function loginWithGoogle(): Promise<UserProfile> {
  // Standard demo google user or admin
  const user = DEMO_USERS[0]; // Chandra Mohan Admin
  saveStoredUser(user);
  return user;
}

export function logoutUser(): void {
  saveStoredUser(null);
  window.dispatchEvent(new CustomEvent('cm_auth_changed', { detail: null }));
}

export function updateUserPlan(userId: string, newPlan: PlanType, billingCycle: 'monthly' | 'yearly' = 'monthly'): UserProfile | null {
  const current = getStoredUser();
  if (!current || current.id !== userId) return null;

  const updated: UserProfile = {
    ...current,
    plan: newPlan,
    subscriptionStatus: newPlan === 'pro' ? 'active' : 'none',
    billingCycle: newPlan === 'pro' ? billingCycle : undefined,
    subscriptionEndDate: newPlan === 'pro'
      ? new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 86400000).toISOString()
      : undefined
  };

  saveStoredUser(updated);
  window.dispatchEvent(new CustomEvent('cm_auth_changed', { detail: updated }));
  return updated;
}
