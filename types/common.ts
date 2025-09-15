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
  type: 'like' | 'comment' | 'follow' | 'membership' | 'donation' | 'message' | 'payment' | 'activity';
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
  type: 'card' | 'bank';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  cardholderName?: string;
  isDefault: boolean;
}

// 결제 내역 타입
export interface PaymentHistory {
  id: string;
  type: "membership" | "tip" | "bean";
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
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
  status: 'completed' | 'pending';
  avatar?: string;
  isAnonymous: boolean;
}

// 수익 관련 타입
export interface Earning {
  id: string;
  date: string;
  source: 'membership' | 'donation' | 'tip';
  amount: number;
  description: string;
  status: 'completed' | 'pending';
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