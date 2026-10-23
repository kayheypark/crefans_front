import { apiClient } from "./client";

// 사용자 정보 관련 API 함수들
export const userAPI = {
  // 닉네임 변경
  updateNickname: async (nickname: string) => {
    const response = await apiClient.put(
      `/auth/nickname`,
      { nickname },
      { withCredentials: true },
    );
    return response.data;
  },

  // 핸들 변경
  updateHandle: async (preferredUsername: string) => {
    const response = await apiClient.put(
      `/auth/handle`,
      { preferredUsername },
      { withCredentials: true },
    );
    return response.data;
  },

  // 프로필 정보 업데이트
  updateUserProfile: async (bio: string) => {
    const response = await apiClient.put(
      `/user/profile`,
      { bio },
      { withCredentials: true },
    );
    return response.data;
  },

  // 계정 삭제
  deleteAccount: async () => {
    const response = await apiClient.delete(`/user/account`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 닉네임 중복 확인
  checkNickname: async (nickname: string) => {
    const response = await apiClient.get(
      `/user/check-nickname?nickname=${nickname}`,
      { withCredentials: false },
    );
    return response.data;
  },

  // 핸들로 사용자 프로필 조회
  getUserProfileByHandle: async (handle: string) => {
    const response = await apiClient.get(`/user/profile/${handle}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 사용자 포스트 조회
  getUserPosts: async (handle: string, cursor?: string, limit: number = 20) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await apiClient.get(
      `/user/posts/${handle}?${params.toString()}`,
      { withCredentials: true },
    );
    return response.data;
  },

  // 크리에이터 카테고리 목록 조회
  getCreatorCategories: async () => {
    const response = await apiClient.get(`/user/creator-categories`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 크리에이터로 전환
  becomeCreator: async (categoryId: string) => {
    const response = await apiClient.post(
      `/user/become-creator`,
      { category_id: categoryId },
      { withCredentials: true },
    );
    return response.data;
  },

  // 크리에이터 상태 조회
  getCreatorStatus: async () => {
    const response = await apiClient.get(`/user/creator-status`, {
      withCredentials: true,
    });
    return response.data;
  },
};
