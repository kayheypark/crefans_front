// Auth Request DTOs (matching server exactly with snake_case where applicable)
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phoneNumber: string;
  isEarlybird?: boolean;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignOutRequest {
  accessToken: string;
}

export interface ConfirmSignUpRequest {
  email: string;
  confirmationCode: string;
}

export interface ResendConfirmationCodeRequest {
  email: string;
}

export interface ConfirmEmailVerificationRequest {
  email: string;
  code: string;
}

export interface UpdateNicknameRequest {
  nickname: string;
}

export interface UpdateHandleRequest {
  preferredUsername: string;
}

export interface UpdateUserProfileRequest {
  bio: string;
}

// Auth Response interfaces
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  nickname: string;
  handle?: string;
  avatar?: string;
  bio?: string;
  phoneNumber?: string;
  isEarlybird?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Cognito user format returned from server
export interface CognitoUser {
  username: string;
  attributes: {
    email: string;
    email_verified: boolean;
    preferred_username: string;
    name: string;
    sub: string;
    picture?: string;
    nickname: string;
    phone_number: string;
  };
  points?: number;
  isCreator?: boolean;
  profile?: {
    bio?: string;
    created_at?: string;
    updated_at?: string;
  };
}

// Response from /auth/me endpoint
export interface GetMeResponse {
  user: CognitoUser;
}

export interface AuthApiResponse {
  success: boolean;
  data: {
    accessToken?: string;
    refreshToken?: string;
    user?: UserResponse;
  };
  message?: string;
}

export interface SignUpResponse extends AuthApiResponse {}
export interface SignInResponse extends AuthApiResponse {}

export interface SignOutResponse {
  success: boolean;
  message: string;
}

export interface ConfirmSignUpResponse {
  success: boolean;
  message: string;
  data?: {
    user?: UserResponse;
  };
}

export interface ResendConfirmationCodeResponse {
  success: boolean;
  message: string;
}

export interface ConfirmEmailVerificationResponse {
  success: boolean;
  message: string;
}

export interface UpdateNicknameResponse {
  success: boolean;
  message: string;
  data?: {
    nickname: string;
  };
}

export interface UpdateHandleResponse {
  success: boolean;
  message: string;
  data?: {
    handle: string;
  };
}

export interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  data?: {
    bio: string;
  };
}

// Legacy DTOs for backwards compatibility
export type SignUpDto = SignUpRequest;
export type SignInDto = SignInRequest;
export type SignOutDto = SignOutRequest;
export type ConfirmSignUpDto = ConfirmSignUpRequest;
export type ResendConfirmationCodeDto = ResendConfirmationCodeRequest;
export type ConfirmEmailVerificationDto = ConfirmEmailVerificationRequest;
export type UpdateNicknameDto = UpdateNicknameRequest;
export type UpdateHandleDto = UpdateHandleRequest;
export type UpdateUserProfileDto = UpdateUserProfileRequest;