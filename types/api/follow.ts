export interface FollowUser {
  userId: string;
  nickname: string;
  handle: string;
  avatar: string;
  followedAt: string;
  isFollowedByRequester?: boolean; // 요청자가 이 사용자를 팔로우하고 있는지
}

export interface FollowListResponse {
  items: FollowUser[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FollowResponse {
  success: boolean;
  message?: string;
  data?: FollowListResponse;
}
