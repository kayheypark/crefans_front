import axios from "axios";
import { getApiUrl } from "@/utils/env";

// 사용자 정보 관련 API 함수들
export const userAPI = {
  // 닉네임 변경
  updateNickname: async (nickname: string) => {
    const response = await axios.put(
      `${getApiUrl()}/user/nickname`,
      { nickname },
      { withCredentials: true }
    );
    return response.data;
  },

  // 핸들 변경
  updateHandle: async (preferred_username: string) => {
    const response = await axios.put(
      `${getApiUrl()}/user/handle`,
      { preferred_username },
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
};
