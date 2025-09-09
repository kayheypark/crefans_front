import { apiClient } from './client';

export interface EarlybirdStatus {
  isEarlybird: boolean;
  joinedAt: string | null;
  rewarded: boolean;
  rewardedAt: string | null;
}

export interface EarlybirdStats {
  totalCount: number;
  rewardedCount: number;
  pendingCount: number;
}

export interface EarlybirdResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const earlybirdApi = {
  // 얼리버드 가입
  async joinEarlybird(): Promise<EarlybirdResponse> {
    try {
      const response = await apiClient.post('/earlybird/join');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '얼리버드 가입에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 얼리버드 상태 확인
  async getEarlybirdStatus(): Promise<EarlybirdResponse & { data: EarlybirdStatus }> {
    try {
      const response = await apiClient.get('/earlybird/status');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '얼리버드 상태 확인에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 얼리버드 통계 조회 (공개)
  async getEarlybirdStats(): Promise<EarlybirdResponse & { data: EarlybirdStats }> {
    try {
      const response = await apiClient.get('/earlybird/stats');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '얼리버드 통계 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 혜택 지급 처리 (관리자용)
  async markAsRewarded(): Promise<EarlybirdResponse> {
    try {
      const response = await apiClient.post('/earlybird/reward');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '혜택 지급 처리에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },
};