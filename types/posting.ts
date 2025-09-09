export enum PostingStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface MediaResponse {
  id: string;
  type: string;
  original_name: string;
  original_url: string;
  processed_urls?: any;
  thumbnail_urls?: any;
  processing_status: string;
}

export interface PostingResponse {
  id: number;
  user_sub: string;
  title: string;
  content: string;
  status: PostingStatus;
  is_membership: boolean;
  membership_level?: number;
  publish_start_at?: string;
  publish_end_at?: string;
  allow_individual_purchase: boolean;
  individual_purchase_price?: number;
  is_public: boolean;
  is_sensitive: boolean;
  total_view_count: number;
  unique_view_count: number;
  like_count: number;
  comment_count: number;
  published_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  medias: MediaResponse[];
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
    id: number;
    message: string;
  };
}