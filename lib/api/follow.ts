import { apiClient } from "./client";

export interface FollowUser {
  userId: string;
  nickname: string;
  handle: string;
  avatar: string;
  followedAt: string;
}

export interface FollowListResponse {
  items: FollowUser[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FollowResponse {
  success: boolean;
  message?: string;
  data?: FollowListResponse;
}

export const followApi = {
  // 팔로우하기
  async followUser(userId: string): Promise<FollowResponse> {
    try {
      const response = await apiClient.post(`/follow/${userId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "팔로우 처리에 실패했습니다.";
      throw new Error(errorMessage);
    }
  },

  // 언팔로우하기
  async unfollowUser(userId: string): Promise<FollowResponse> {
    try {
      const response = await apiClient.delete(`/follow/${userId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "언팔로우 처리에 실패했습니다.";
      throw new Error(errorMessage);
    }
  },

  // 내 팔로잉 목록 조회
  async getMyFollowing(
    page: number = 1,
    limit: number = 20
  ): Promise<FollowResponse> {
    try {
      const response = await apiClient.get("/follow/my-following", {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "내 팔로잉 목록 조회에 실패했습니다.";
      throw new Error(errorMessage);
    }
  },
};
