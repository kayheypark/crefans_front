import { BaseApiResponse } from "@/types/api";
import {
  ConfirmSignUpRequest,
  ConfirmSignUpResponse,
  GetMeResponse,
  ResendConfirmationCodeRequest,
  ResendConfirmationCodeResponse,
  SignInRequest,
  SignInResponse,
  SignOutResponse,
  SignUpRequest,
  SignUpResponse,
  UpdateHandleRequest,
  UpdateHandleResponse,
  UpdateNicknameRequest,
  UpdateNicknameResponse,
} from "@/types/auth";
import { apiClient } from "./client";

// 인증 관련 API 함수들
export const authAPI = {
  async confirmEmailVerification(email: string, code: string) {
    const response = await apiClient.get<{
      success: boolean;
      message?: string;
    }>("/auth/confirm-email-verification", {
      params: { email, code },
      withCredentials: false,
    });
    return response.data;
  },
  // 로그인
  signin: async (email: string, password: string): Promise<SignInResponse> => {
    const response = await apiClient.post(
      `/auth/signin`,
      { email, password } as SignInRequest,
      { withCredentials: true },
    );
    return response.data;
  },

  // 회원가입
  signup: async (userData: SignUpRequest): Promise<SignUpResponse> => {
    const response = await apiClient.post(`/auth/signup`, userData, {
      withCredentials: false,
    });
    return response.data;
  },

  // 이메일 인증 확인
  confirmSignup: async (
    email: string,
    confirmationCode: string,
  ): Promise<ConfirmSignUpResponse> => {
    const response = await apiClient.post(
      `/auth/confirm-signup`,
      {
        email,
        confirmationCode,
      } as ConfirmSignUpRequest,
      { withCredentials: false },
    );
    return response.data;
  },

  // 로그아웃
  signout: async (): Promise<SignOutResponse> => {
    const response = await apiClient.post(
      `/auth/signout`,
      {},
      { withCredentials: true },
    );
    return response.data;
  },

  // 사용자 정보 조회
  getMe: async (): Promise<BaseApiResponse<GetMeResponse>> => {
    const response = await apiClient.get(`/auth/me`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 이메일 중복 확인
  checkEmail: async (email: string) => {
    const response = await apiClient.get(`/auth/check-email?email=${email}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 인증코드 재전송
  resendConfirmationCode: async (
    email: string,
  ): Promise<ResendConfirmationCodeResponse> => {
    const response = await apiClient.post(
      `/auth/resend-confirmation-code`,
      {
        email,
      } as ResendConfirmationCodeRequest,
      { withCredentials: false },
    );
    return response.data;
  },

  // 닉네임 변경
  updateNickname: async (nickname: string): Promise<UpdateNicknameResponse> => {
    const response = await apiClient.put(
      `/auth/nickname`,
      { nickname } as UpdateNicknameRequest,
      { withCredentials: true },
    );
    return response.data;
  },

  // 핸들 변경
  updateHandle: async (
    preferredUsername: string,
  ): Promise<UpdateHandleResponse> => {
    const response = await apiClient.put(
      `/auth/handle`,
      { preferredUsername } as UpdateHandleRequest,
      { withCredentials: true },
    );
    return response.data;
  },

  // 토큰 갱신
  refreshToken: async () => {
    const response = await apiClient.post(
      `/auth/refresh`,
      {},
      { withCredentials: true },
    );
    return response.data;
  },
};
