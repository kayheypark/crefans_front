// Response interfaces (matching server DTOs)
export interface CreatorCategoryResponse {
  id: string;
  name: string;
  description: string;
  color_code: string;
  icon: string;
  sort_order: number;
  is_active?: boolean;
}

export interface CreatorResponse {
  id?: string;
  nickname: string;
  handle: string;
  avatar?: string;
  bio?: string | null;
  followerCount: number;
  postCount: number;
  following?: number; // For backwards compatibility
  followers?: number; // For backwards compatibility
  posts?: number; // For backwards compatibility
  createdAt?: string;
  updatedAt?: string;
  created_at?: Date;
  category?: CreatorCategoryResponse | null;
  isNew?: boolean;
  bannerImage?: string;
}

// Request DTOs
export interface GetCreatorsByCategoryRequest {
  limit?: number;
  cursor?: string;
}

export interface GetNewCreatorsRequest {
  limit?: number;
  cursor?: string;
}

// API Response types
export interface NewCreatorsResponse {
  success: boolean;
  data: {
    creators: CreatorResponse[];
    nextCursor?: string;
    hasMore: boolean;
  };
}

export interface CreatorsByCategoryResponse {
  success: boolean;
  data: {
    creators: CreatorResponse[];
    category: CreatorCategoryResponse;
    nextCursor?: string;
    hasMore: boolean;
  };
}

// Legacy types for backwards compatibility
export type CreatorCategory = CreatorCategoryResponse;
export type Creator = CreatorResponse;
