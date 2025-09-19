// Base API Response types matching server exactly
export interface BaseApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Legacy API Response for backwards compatibility
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Specific response types
export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    isLiked: boolean;
    likeCount: number;
  };
}

// Auth related responses
export interface AuthResponse {
  success: boolean;
  data: {
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id: string;
      email: string;
      name: string;
      nickname: string;
      handle?: string;
      avatar?: string;
    };
  };
}

// Subscription related responses (matching server DTOs)
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
    status?: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'PAST_DUE' | 'UNPAID';
  };
}

export interface UnsubscriptionResponse {
  success: boolean;
  data: {
    membershipItemId: string;
    unsubscribedAt: string;
  };
}

// Type aliases for specific responses
export type CommentLikeResponse = LikeResponse;
export type PostingLikeResponse = LikeResponse;