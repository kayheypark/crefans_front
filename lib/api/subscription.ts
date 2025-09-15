import { apiClient } from './client';
import { ApiResponse, SubscriptionResponse, UnsubscriptionResponse } from '@/types/api';

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
  subscriptions: SubscriptionInfo[];
}

export interface SubscriptionRequest {
  membershipItemId: number;
}

export const subscriptionAPI = {
  async getMySubscriptions(): Promise<ApiResponse<SubscriptionListResponse>> {
    try {
      const response = await apiClient.get('/subscription/my/list');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '구독 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },


  async unsubscribeFromMembership(membershipItemId: number): Promise<ApiResponse<UnsubscriptionResponse>> {
    try {
      const response = await apiClient.delete(`/subscription/membership/${membershipItemId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '멤버십 구독 취소에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },
};