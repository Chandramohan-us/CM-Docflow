import { PaymentInvoice } from '../types/billing';
import { PlanType, BillingCycle, UserProfile } from '../types/user';
import { updateUserPlan } from './authService';

const INVOICES_STORAGE_KEY = 'cm_docflow_invoices';

export interface PaymentGatewayResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  signature?: string;
  error?: string;
}

export function getStoredInvoices(userId: string): PaymentInvoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (!raw) return getDefaultInvoices(userId);
    const list: PaymentInvoice[] = JSON.parse(raw);
    return list.filter((inv) => inv.userId === userId);
  } catch {
    return getDefaultInvoices(userId);
  }
}

function getDefaultInvoices(userId: string): PaymentInvoice[] {
  return [
    {
      id: 'inv_1001',
      userId,
      invoiceNumber: 'INV-2026-0041',
      planId: 'pro',
      billingCycle: 'monthly',
      amount: 299,
      currency: 'INR',
      status: 'paid',
      date: '2026-03-01T10:00:00.000Z',
      paymentMethod: 'UPI (Google Pay)',
      razorpayPaymentId: 'pay_NzK891hX047'
    }
  ];
}

export function saveInvoice(invoice: PaymentInvoice): void {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    const list: PaymentInvoice[] = raw ? JSON.parse(raw) : [];
    list.unshift(invoice);
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save invoice', e);
  }
}

/**
 * Simulates or connects to Razorpay Payment Flow
 */
export async function processRazorpayCheckout(
  user: UserProfile,
  plan: PlanType,
  cycle: BillingCycle,
  amountINR: number
): Promise<PaymentGatewayResponse> {
  // In demo / production preview, create a realistic payment receipt and activate
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const paymentId = `pay_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const orderId = `order_${Math.random().toString(36).substring(2, 9)}`;

  // Create invoice
  const newInvoice: PaymentInvoice = {
    id: `inv_${Date.now()}`,
    userId: user.id,
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    planId: plan,
    billingCycle: cycle,
    amount: amountINR,
    currency: 'INR',
    status: 'paid',
    date: new Date().toISOString(),
    paymentMethod: 'Razorpay UPI / NetBanking',
    razorpayPaymentId: paymentId,
    razorpayOrderId: orderId
  };

  saveInvoice(newInvoice);
  updateUserPlan(user.id, plan, cycle);

  return {
    success: true,
    paymentId,
    orderId
  };
}

/**
 * Cancel user subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  updateUserPlan(userId, 'free');
  return true;
}
