import { ApiResponse } from "@/types/api";
import type {
  MyBillingSubscriptionsResponse,
  SubscriptionBillingConfirmRequest,
  SubscriptionBillingConfirmResponse,
  SubscriptionBillingPrepareRequest,
  SubscriptionBillingPrepareResponse,
} from "@/types/api/subscriptionBilling";
import { apiClient } from "./client";
export type {
  MyBillingSubscription,
  MyBillingSubscriptionsResponse,
  SubscriptionBillingConfirmRequest,
  SubscriptionBillingConfirmResponse,
  SubscriptionBillingPrepareRequest,
  SubscriptionBillingPrepareResponse,
} from "@/types/api/subscriptionBilling";

// 구독 청구 관련 API 함수들
export const subscriptionBillingAPI = {
  // 구독 청구 준비 (TossPayments 자동결제 준비)
  prepareBilling: async (
    data: SubscriptionBillingPrepareRequest,
  ): Promise<ApiResponse<SubscriptionBillingPrepareResponse>> => {
    const response = await apiClient.post(
      `/subscription/billing/prepare`,
      data,
      { withCredentials: true },
    );
    return response.data;
  },

  // 구독 청구 확인 (TossPayments 자동결제 확인)
  confirmBilling: async (
    data: SubscriptionBillingConfirmRequest,
  ): Promise<ApiResponse<SubscriptionBillingConfirmResponse>> => {
    const response = await apiClient.post(
      `/subscription/billing/confirm`,
      data,
      { withCredentials: true },
    );
    return response.data;
  },

  // 내 구독 목록 조회
  getMyBillingSubscriptions: async (): Promise<
    ApiResponse<MyBillingSubscriptionsResponse>
  > => {
    const response = await apiClient.get(`/subscription/billing/my`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 구독 취소
  cancelBillingSubscription: async (
    subscriptionId: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.delete(
      `/subscription/billing/${subscriptionId}`,
      { withCredentials: true },
    );
    return response.data;
  },
};
