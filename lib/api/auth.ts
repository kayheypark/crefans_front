import axios from "axios";
import { getApiUrl } from "@/utils/env";

// 인증 관련 API 함수들
export const authAPI = {
  // 로그인
  signin: async (email: string, password: string) => {
    const response = await axios.post(
      `${getApiUrl()}/auth/signin`,
      { email, password },
      { withCredentials: true }
    );
    return response.data;
  },

  // 회원가입
  signup: async (userData: {
    email: string;
    password: string;
    name: string;
    nickname: string;
    phoneNumber: string;
  }) => {
    const response = await axios.post(`${getApiUrl()}/auth/signup`, userData);
    return response.data;
  },

  // 이메일 인증 확인
  confirmSignup: async (email: string, confirmationCode: string) => {
    const response = await axios.post(`${getApiUrl()}/auth/confirm-signup`, {
      email,
      confirmationCode,
    });
    return response.data;
  },

  // 로그아웃
  signout: async () => {
    const response = await axios.post(
      `${getApiUrl()}/auth/signout`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  // 사용자 정보 조회
  getMe: async () => {
    const response = await axios.get(`${getApiUrl()}/auth/me`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 이메일 중복 확인
  checkEmail: async (email: string) => {
    const response = await axios.get(
      `${getApiUrl()}/auth/check-email?email=${email}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  // 인증코드 재전송
  resendConfirmationCode: async (email: string) => {
    const response = await axios.post(
      `${getApiUrl()}/auth/resend-confirmation-code`,
      {
        email,
      }
    );
    return response.data;
  },
};
