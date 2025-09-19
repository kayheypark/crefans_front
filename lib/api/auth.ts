import axios from "axios";
import { getApiUrl } from "@/utils/env";
import {
  SignInRequest,
  SignUpRequest,
  ConfirmSignUpRequest,
  ResendConfirmationCodeRequest,
  UpdateNicknameRequest,
  UpdateHandleRequest,
  SignInResponse,
  SignUpResponse,
  ConfirmSignUpResponse,
  SignOutResponse,
  ResendConfirmationCodeResponse,
  UpdateNicknameResponse,
  UpdateHandleResponse,
  UserResponse,
  GetMeResponse
} from '@/types/auth';
import { BaseApiResponse } from '@/types/api';

// 인증 관련 API 함수들
export const authAPI = {
  // 로그인
  signin: async (email: string, password: string): Promise<SignInResponse> => {
    const response = await axios.post(
      `${getApiUrl()}/auth/signin`,
      { email, password } as SignInRequest,
      { withCredentials: true }
    );
    return response.data;
  },

  // 회원가입
  signup: async (userData: SignUpRequest): Promise<SignUpResponse> => {
    const response = await axios.post(`${getApiUrl()}/auth/signup`, userData);
    return response.data;
  },

  // 이메일 인증 확인
  confirmSignup: async (email: string, confirmationCode: string): Promise<ConfirmSignUpResponse> => {
    const response = await axios.post(`${getApiUrl()}/auth/confirm-signup`, {
      email,
      confirmationCode,
    } as ConfirmSignUpRequest);
    return response.data;
  },

  // 로그아웃
  signout: async (): Promise<SignOutResponse> => {
    const response = await axios.post(
      `${getApiUrl()}/auth/signout`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  // 사용자 정보 조회
  getMe: async (): Promise<BaseApiResponse<GetMeResponse>> => {
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
  resendConfirmationCode: async (email: string): Promise<ResendConfirmationCodeResponse> => {
    const response = await axios.post(
      `${getApiUrl()}/auth/resend-confirmation-code`,
      {
        email,
      } as ResendConfirmationCodeRequest
    );
    return response.data;
  },

  // 닉네임 변경
  updateNickname: async (nickname: string): Promise<UpdateNicknameResponse> => {
    const response = await axios.put(
      `${getApiUrl()}/auth/nickname`,
      { nickname } as UpdateNicknameRequest,
      { withCredentials: true }
    );
    return response.data;
  },

  // 핸들 변경
  updateHandle: async (preferredUsername: string): Promise<UpdateHandleResponse> => {
    const response = await axios.put(
      `${getApiUrl()}/auth/handle`,
      { preferredUsername } as UpdateHandleRequest,
      { withCredentials: true }
    );
    return response.data;
  },

  // 토큰 갱신
  refreshToken: async () => {
    const response = await axios.post(
      `${getApiUrl()}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },
};
