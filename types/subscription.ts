// Subscription Request DTOs (matching server exactly)
export interface SubscribeMembershipRequest {
  membershipItemId: string;
}

export interface ConfirmSubscriptionRequest {
  authKey: string;
  customerKey: string;
  userId: string;
  membershipItemId: string;
}

// Subscription Status enum (matching server)
export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'CANCELLED'
  | 'PAST_DUE'
  | 'UNPAID';

// Subscription Response interfaces
export interface SubscriptionResponse {
  success: boolean;
  data: {
    subscriptionId?: string;
    membershipItemId?: string;
    membershipName?: string;
    price?: number;
    billingPeriod?: number;
    billingUnit?: string;
    customerKey?: string;
    clientKey?: string;
    successUrl?: string;
    failUrl?: string;
    nextBillingDate?: string;
    status?: SubscriptionStatus;
  };
}

export interface MySubscriptionItem {
  id: string;
  membershipName: string;
  creatorId: string;
  creator: {
    id: string;
    handle: string;
    name: string;
    avatar?: string;
  };
  amount: number;
  status: SubscriptionStatus;
  nextBillingDate?: string;
  autoRenew: boolean;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
}

export interface MySubscriptionsResponse {
  success: boolean;
  data: MySubscriptionItem[];
}

// Additional subscription types for frontend
export interface SubscriptionInfo {
  creatorId: string;
  creatorName: string;
  membershipType: string;
  membershipLevel: number;
  startedAt: string;
  avatar: string;
  unread: boolean;
}

export interface SubscriptionListResponse {
  success: boolean;
  data: {
    subscriptions: SubscriptionInfo[];
  };
}

export interface UnsubscriptionResponse {
  success: boolean;
  data: {
    membershipItemId: string;
    unsubscribedAt: string;
  };
  message?: string;
}

// Legacy DTOs for backwards compatibility
export type SubscribeMembershipDto = SubscribeMembershipRequest;
export type ConfirmSubscriptionDto = ConfirmSubscriptionRequest;