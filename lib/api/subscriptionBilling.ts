import axios from "axios";
import { getApiUrl } from "@/utils/env";
import { ApiResponse } from '@/types/api';

// 구독 청구 준비 요청 데이터 타입
export interface SubscriptionBillingPrepareRequest {
  membershipItemId: string;  // Updated to string for billing system
}

// 구독 청구 준비 응답 데이터 타입
export interface SubscriptionBillingPrepareResponse {
  clientKey: string;
  customerKey: string;
  successUrl: string;
  failUrl: string;
  membershipItemId: string;  // Updated to string for billing system
  membershipName: string;
  price: number;
  billingPeriod: number;
  billingUnit: string;
}

// 구독 청구 확인 요청 데이터 타입
export interface SubscriptionBillingConfirmRequest {
  authKey: string;
  customerKey: string;
  userId: string;
  membershipItemId: string;  // Updated to string for billing system
}

// 구독 청구 확인 응답 데이터 타입
export interface SubscriptionBillingConfirmResponse {
  success: boolean;
  subscriptionId: string;
  billingKey: string;
  membershipItem: {
    id: string;  // Updated to string for billing system
    name: string;
    price: number;
    billing_unit: string;
    billing_period: number;
  };
  nextBillingDate: string;
}

// 내 구독 목록 응답 데이터 타입
export interface MyBillingSubscription {
  subscriptionId: string;
  membershipItem: {
    id: string;  // Updated to string for billing system
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
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
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

// 구독 청구 관련 API 함수들
export const subscriptionBillingAPI = {
  // 구독 청구 준비 (TossPayments 자동결제 준비)
  prepareBilling: async (data: SubscriptionBillingPrepareRequest): Promise<ApiResponse<SubscriptionBillingPrepareResponse>> => {
    const response = await axios.post(
      `${getApiUrl()}/subscription/billing/prepare`,
      data,
      { withCredentials: true }
    );
    return response.data;
  },

  // 구독 청구 확인 (TossPayments 자동결제 확인)
  confirmBilling: async (data: SubscriptionBillingConfirmRequest): Promise<ApiResponse<SubscriptionBillingConfirmResponse>> => {
    const response = await axios.post(
      `${getApiUrl()}/subscription/billing/confirm`,
      data,
      { withCredentials: true }
    );
    return response.data;
  },

  // 내 구독 목록 조회
  getMyBillingSubscriptions: async (): Promise<ApiResponse<MyBillingSubscriptionsResponse>> => {
    const response = await axios.get(
      `${getApiUrl()}/subscription/billing/my`,
      { withCredentials: true }
    );
    return response.data;
  },

  // 구독 취소
  cancelBillingSubscription: async (subscriptionId: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await axios.delete(
      `${getApiUrl()}/subscription/billing/${subscriptionId}`,
      { withCredentials: true }
    );
    return response.data;
  },
};