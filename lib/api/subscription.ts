import { apiClient } from './client';
import {
  SubscriptionResponse,
  UnsubscriptionResponse,
  SubscriptionListResponse,
  SubscribeMembershipRequest
} from '@/types/subscription';
import { BaseApiResponse } from '@/types/api';

// Legacy interfaces (moved to types/subscription.ts)
export interface SubscriptionRequest {
  membershipItemId: string; // Changed to string to match server
}

export const subscriptionAPI = {
  async getMySubscriptions(): Promise<SubscriptionListResponse> {
    try {
      const response = await apiClient.get('/subscription/my/list');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '구독 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },


  async unsubscribeFromMembership(membershipItemId: string): Promise<UnsubscriptionResponse> {
    try {
      const response = await apiClient.delete(`/subscription/membership/${membershipItemId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '멤버십 구독 취소에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },
};