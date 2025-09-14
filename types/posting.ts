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
}

export interface UserResponse {
  id: string;
  handle: string;
  name: string;
  avatar: string;
}

export interface PostingResponse {
  id: string;
  userSub: string;
  user: UserResponse;
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
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  medias: MediaResponse[];
  isLiked: boolean;
}

export interface CreatePostingDto {
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
}

export interface UpdatePostingDto {
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
}

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