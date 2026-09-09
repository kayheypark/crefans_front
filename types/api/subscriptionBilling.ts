export interface SubscriptionBillingPrepareRequest {
  membershipItemId: string; // Updated to string for billing system
}

export interface SubscriptionBillingPrepareResponse {
  clientKey: string;
  customerKey: string;
  successUrl: string;
  failUrl: string;
  membershipItemId: string; // Updated to string for billing system
  membershipName: string;
  price: number;
  billingPeriod: number;
  billingUnit: string;
}

export interface SubscriptionBillingConfirmRequest {
  authKey: string;
  customerKey: string;
  userId: string;
  membershipItemId: string; // Updated to string for billing system
}

export interface SubscriptionBillingConfirmResponse {
  success: boolean;
  subscriptionId: string;
  billingKey: string;
  membershipItem: {
    id: string; // Updated to string for billing system
    name: string;
    price: number;
    billing_unit: string;
    billing_period: number;
  };
  nextBillingDate: string;
}

export interface MyBillingSubscription {
  subscriptionId: string;
  membershipItem: {
    id: string; // Updated to string for billing system
    name: string;
    price: number;
    billing_unit: string;
    billing_period: number;
    creator_id: string;
  };
  creator: {
    id: string;
    name: string;
    handle: string;
    avatar?: string;
  };
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  nextBillingDate: string;
  startedAt: string;
  cancelledAt?: string;
  autoRenew: boolean;
  totalPaidAmount: number;
}

export interface MyBillingSubscriptionsResponse {
  subscriptions: MyBillingSubscription[];
  totalCount: number;
}
