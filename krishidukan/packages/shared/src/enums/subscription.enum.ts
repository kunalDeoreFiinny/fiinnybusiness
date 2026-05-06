export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  TRIALING = 'trialing',
}

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.FREE]: 0,
  [SubscriptionPlan.BASIC]: 500,
  [SubscriptionPlan.PRO]: 2000,
  [SubscriptionPlan.ENTERPRISE]: 5000,
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.FREE]: 'Free',
  [SubscriptionPlan.BASIC]: '₹500/month',
  [SubscriptionPlan.PRO]: '₹2,000/month',
  [SubscriptionPlan.ENTERPRISE]: '₹5,000/month',
};
