export interface Plan {
  name: string;
  description?: string;
  features?: string[];

  monthly: {
    planId: string;
    interval: string;
    amount?: number;
  } | null;

  yearly: {
    planId: string;
    interval: string;
    amount?: number;
  } | null;
}

export interface UserSubscription {
  plan: 'free' | 'pro' | 'premium';
  billingCycle?: 'monthly' | 'yearly';
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'pending' | 'halted' | null;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  razorpaySubscriptionId?: string;
}

export interface BillingPlan extends Plan {
  isPopular?: boolean;
  yearlySavingsPct?: number;
}