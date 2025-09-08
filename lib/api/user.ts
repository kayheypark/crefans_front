import axios from "axios";
import { getApiUrl } from "@/utils/env";

// 사용자 정보 관련 API 함수들
export const userAPI = {
  // 닉네임 변경
  updateNickname: async (nickname: string) => {
    const response = await axios.put(
      `${getApiUrl()}/auth/nickname`,
      { nickname },
      { withCredentials: true }
    );
    return response.data;
  },

  // 핸들 변경
  updateHandle: async (preferredUsername: string) => {
    const response = await axios.put(
      `${getApiUrl()}/auth/handle`,
      { preferredUsername },
      { withCredentials: true }
    );
    return response.data;
  },

  // 프로필 정보 업데이트
  updateUserProfile: async (bio: string) => {
    const response = await axios.put(
      `${getApiUrl()}/user/profile`,
      { bio },
      { withCredentials: true }
    );
    return response.data;
  },

  // 계정 삭제
  deleteAccount: async () => {
    const response = await axios.delete(`${getApiUrl()}/user/account`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 닉네임 중복 확인
  checkNickname: async (nickname: string) => {
    const response = await axios.get(
      `${getApiUrl()}/user/check-nickname?nickname=${nickname}`
    );
    return response.data;
  },

  // 핸들로 사용자 프로필 조회
  getUserProfileByHandle: async (handle: string) => {
    const response = await axios.get(
      `${getApiUrl()}/user/profile/${handle}`
    );
    return response.data;
  },

  // 사용자 포스트 조회
  getUserPosts: async (handle: string, page: number = 1, limit: number = 20) => {
    const response = await axios.get(
      `${getApiUrl()}/user/posts/${handle}?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
