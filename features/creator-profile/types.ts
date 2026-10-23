import { CreatorCategory } from "@/types/creator";
export interface MediaItem {
  id: number;
  title: string;
  type: "video" | "image";
  url: string;
  thumbnail: string;
  createdAt: string;
  views: number;
  likes: number;
  duration?: string;
}

export interface Membership {
  id: string; // Updated to string for billing system
  name: string;
  level: number;
  price: number; // Will be parsed from backend string
  description?: string;
  benefits: string[]; // Will be parsed from backend string
  billing_unit?: string;
  billing_period?: number;
  trial_unit?: string;
  trial_period?: number;
}

export interface UserProfile {
  id: number;
  handle: string;
  name: string;
  avatar: string;
  bio: string;
  isCreator: boolean;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  mediaCount: number;
  userSub?: string; // 팔로우 API 호출을 위한 userSub 추가
  isFollowing?: boolean; // 팔로우 상태 추가
  category?: CreatorCategory | null; // 크리에이터 카테고리 정보 추가
  hasSubscription?: boolean; // 내가 이 크리에이터를 구독했는지 여부
  subscribedMembershipIds?: string[]; // 내가 구독 중인 멤버십 ID 목록
}

export interface ProfileProps {
  handle: string;
}
