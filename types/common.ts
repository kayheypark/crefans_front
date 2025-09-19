// Utility Types for API operations
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type SortOrder = 'asc' | 'desc';

export type LoadingState = 'idle' | 'pending' | 'loading' | 'success' | 'error';

// Generic pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
}

// Form 값 관련 타입
export interface FormValues {
  [key: string]: any;
}

export interface ReportFormValues {
  reason: string;
  description?: string;
}

export interface ProfileEditFormValues {
  nickname?: string;
  bio?: string;
  website?: string;
  location?: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  nickname: string;
  phoneNumber: string;
}

export interface MembershipFormValues {
  name: string;
  description?: string;
  level: number;
  price: number;
  billing_unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  billing_period: number;
  trial_unit?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  trial_period?: number;
  benefits: string;
}

// Union types for commonly used string literals
export type NotificationType = 'like' | 'comment' | 'follow' | 'membership' | 'donation' | 'message' | 'payment' | 'activity';
export type CommonPaymentStatus = 'completed' | 'pending' | 'failed';
export type PaymentMethodType = 'card' | 'bank';
export type EarningSource = 'membership' | 'donation' | 'tip';
export type PostingType = 'membership' | 'tip' | 'bean';

export interface PaymentMethodFormValues {
  type: 'card' | 'bank';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  bankName?: string;
  accountNumber?: string;
  isDefault?: boolean;
  cardholderName?: string;
  cardAlias?: string;
}

import { UploadChangeParam, UploadFile } from 'antd/es/upload/interface';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';

// 업로드 관련 타입 (Antd 기반)
export type UploadInfo = UploadChangeParam<UploadFile>;
export type CustomUploadRequest = RcCustomRequestOptions;

// 알림 관련 타입
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  createdAt: string;
  read: boolean;
  userId?: string;
  postId?: string;
  avatar?: string;
}

// 멤버십 크리에이터 타입
export interface MembershipCreator {
  key: string;
  name: string;
  avatar?: string;
  price?: number;
  membershipType: string;
  creatorHandle?: string;
  unread: boolean;
}

// 팔로우 크리에이터 타입
export interface FollowCreator {
  key: string;
  nickname: string;
  avatar: string;
  handle: string;
  unread: boolean;
}

// 결제 수단 타입
export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  lastFour?: string;
  expiryDate?: string;
  cardholderName?: string;
  isDefault: boolean;
}

// 결제 내역 타입
export interface PaymentHistory {
  id: string;
  type: PostingType;
  amount: number;
  currency: string;
  status: CommonPaymentStatus;
  description: string;
  paymentMethod: string;
  date: string;
  merchant: string;
}

// 기부 관련 타입
export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  message?: string;
  date: string;
  status: Exclude<CommonPaymentStatus, 'failed'>;
  avatar?: string;
  isAnonymous: boolean;
}

// 수익 관련 타입
export interface Earning {
  id: string;
  date: string;
  source: EarningSource;
  amount: number;
  description: string;
  status: Exclude<CommonPaymentStatus, 'failed'>;
}

// 멤버십 관련 타입 (테이블용)
export interface MembershipTableItem {
  id: number;
  name: string;
  level: number;
  price: number;
  billing_unit: string;
  billing_period: number;
  subscribers: number;
  is_active: boolean;
  created_at: string;
}