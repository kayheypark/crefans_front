import { apiClient } from './client';

export interface FollowStatus {
  isFollowing: boolean;
  followedAt: string | null;
}

export interface FollowStats {
  followerCount: number;
  followingCount: number;
}

export interface FollowUser {
  userId: string;
  followedAt: string;
}

export interface FollowListResponse {
  followers?: FollowUser[];
  following?: FollowUser[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface FollowResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const followApi = {
  // 팔로우하기
  async followUser(userId: string): Promise<FollowResponse> {
    try {
      const response = await apiClient.post(`/follow/${userId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '팔로우 처리에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 언팔로우하기
  async unfollowUser(userId: string): Promise<FollowResponse> {
    try {
      const response = await apiClient.delete(`/follow/${userId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '언팔로우 처리에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 팔로우 상태 확인
  async getFollowStatus(userId: string): Promise<FollowResponse & { data: FollowStatus }> {
    try {
      const response = await apiClient.get(`/follow/status/${userId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '팔로우 상태 확인에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 팔로워 목록 조회
  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<FollowResponse & { data: FollowListResponse }> {
    try {
      const response = await apiClient.get(`/follow/${userId}/followers`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '팔로워 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 팔로잉 목록 조회
  async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<FollowResponse & { data: FollowListResponse }> {
    try {
      const response = await apiClient.get(`/follow/${userId}/following`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '팔로잉 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 팔로우 통계 조회
  async getFollowStats(userId: string): Promise<FollowResponse & { data: FollowStats }> {
    try {
      const response = await apiClient.get(`/follow/${userId}/stats`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '팔로우 통계 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 내 팔로워 목록 조회
  async getMyFollowers(page: number = 1, limit: number = 20): Promise<FollowResponse & { data: FollowListResponse }> {
    try {
      const response = await apiClient.get('/follow/my/followers', {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '내 팔로워 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 내 팔로잉 목록 조회
  async getMyFollowing(page: number = 1, limit: number = 20): Promise<FollowResponse & { data: FollowListResponse }> {
    try {
      const response = await apiClient.get('/follow/my/following', {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '내 팔로잉 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 내 팔로우 통계 조회
  async getMyFollowStats(): Promise<FollowResponse & { data: FollowStats }> {
    try {
      const response = await apiClient.get('/follow/my/stats');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '내 팔로우 통계 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },
};