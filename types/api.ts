export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 좋아요/언좋아요 응답 타입
export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    isLiked: boolean;
    likeCount: number;
  };
}

// 구독 관련 응답 타입
export interface SubscriptionResponse {
  membershipItemId: number;
  status: 'active' | 'inactive';
  subscribedAt: string;
}

export interface UnsubscriptionResponse {
  membershipItemId: number;
  unsubscribedAt: string;
}

// API 응답 타입 별칭
export type CommentLikeResponse = LikeResponse;
export type PostingLikeResponse = LikeResponse;