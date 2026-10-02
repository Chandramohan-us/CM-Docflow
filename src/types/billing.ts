import { BillingCycle, PlanType } from './user';

export interface PaymentInvoice {
  id: string;
  userId: string;
  invoiceNumber: string;
  planId: PlanType;
  billingCycle: BillingCycle;
  amount: number; // in INR
  currency: 'INR';
  status: 'paid' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  pdfUrl?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}
