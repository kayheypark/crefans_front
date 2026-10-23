export interface CreatorCategory {
  id: string;
  name: string;
  description: string;
  color_code: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface Creator {
  nickname: string;
  handle: string;
  avatar: string;
  bio: string | null;
  followerCount: number;
  postCount: number;
  category?: CreatorCategory;
  isNew?: boolean;
  bannerImage?: string;
  created_at: string;
}

export interface NewCreatorsResponse {
  creators: Creator[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface CreatorsByCategoryResponse {
  creators: Creator[];
  category: CreatorCategory;
  nextCursor?: string;
  hasMore: boolean;
}
