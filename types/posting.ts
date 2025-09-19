export enum PostingStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface MediaResponse {
  id: string;
  type: string;
  originalName: string;
  mediaUrl: string;
  processedUrls?: any;
  thumbnailUrls?: any;
  processingStatus: string;
  duration?: number;
  // Additional properties that might be available
  width?: number;
  height?: number;
}

export interface PostingUserResponse {
  id: string;
  handle: string;
  name: string;
  avatar: string;
}

export interface PostingResponse {
  id: string;
  userSub: string;
  user: PostingUserResponse;
  title: string;
  content: string;
  status: PostingStatus;
  isMembership: boolean;
  isGotMembership?: boolean;
  membershipLevel?: number;
  publishStartAt?: string;
  publishEndAt?: string;
  allowIndividualPurchase: boolean;
  individualPurchasePrice?: number;
  isPublic: boolean;
  isSensitive: boolean;
  totalViewCount: number;
  uniqueViewCount: number;
  likeCount: number;
  commentCount: number;
  allowComments: boolean;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  medias: MediaResponse[];
  isLiked: boolean;
}

// Request DTOs (matching server exactly with snake_case)
export interface CreatePostingRequest {
  title: string;
  content: string;
  status?: PostingStatus;
  is_membership?: boolean;
  membership_level?: number;
  publish_start_at?: string;
  publish_end_at?: string;
  media_ids?: string[];
  allow_individual_purchase?: boolean;
  individual_purchase_price?: number;
  is_public?: boolean;
  is_sensitive?: boolean;
  allow_comments?: boolean;
}

export interface UpdatePostingRequest {
  title?: string;
  content?: string;
  status?: PostingStatus;
  is_membership?: boolean;
  membership_level?: number;
  publish_start_at?: string;
  publish_end_at?: string;
  media_ids?: string[];
  allow_individual_purchase?: boolean;
  individual_purchase_price?: number;
  is_public?: boolean;
  is_sensitive?: boolean;
  allow_comments?: boolean;
}

export interface PostingQueryRequest {
  page?: number;
  limit?: number;
  status?: PostingStatus;
  is_membership?: boolean;
  user_sub?: string;
  search?: string;
}

// Legacy DTOs for backwards compatibility (deprecated, use Request types)
export type CreatePostingDto = CreatePostingRequest;
export type UpdatePostingDto = UpdatePostingRequest;

export interface PostingListResponse {
  success: boolean;
  data: {
    postings: PostingResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PostingDetailResponse {
  success: boolean;
  data: PostingResponse;
}

export interface CreatePostingResponse {
  success: boolean;
  data: {
    id: string;
    message: string;
  };
}

export interface UpdatePostingResponse {
  success: boolean;
  message: string;
}

// ===== 프론트엔드 폼 상태 인터페이스들 =====

export interface MediaItem {
  id: string;
  url: string; // 블로브 URL (미리보기용)
  s3Url: string; // AWS S3 URL (필수)
  order: number;
}

export interface ImageItem extends MediaItem {
  width?: number; // 원본 이미지 너비
  height?: number; // 원본 이미지 높이
}

export interface VideoItem extends MediaItem {
  duration?: string;
  originalFile?: File; // 원본 파일 참조
  processingStatus?: string; // 처리 상태
}