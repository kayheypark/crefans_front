import { apiClient } from "./client";
import { ApiResponse } from "@/types/api";

// Creator Category Interface
export interface CreatorCategory {
  id: string;
  name: string;
  description: string;
  color_code: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

// Creator Interface - Updated to match backend response
export interface Creator {
  id: string;
  user_id: string;
  nickname: string;
  handle: string;
  avatar: string;
  bio: string;
  followerCount: number;
  postCount: number;
  category?: CreatorCategory;
  isNew?: boolean;
  bannerImage?: string;
  created_at: string;
}

// API Response Types
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

// API Functions
export const exploreAPI = {
  // Get all creator categories
  async getCategories(): Promise<CreatorCategory[]> {
    const response = await apiClient.get<ApiResponse<CreatorCategory[]>>(
      "/explore/categories"
    );
    return response.data.data;
  },

  // Get new creators
  async getNewCreators(
    limit: number = 20,
    cursor?: string
  ): Promise<NewCreatorsResponse> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await apiClient.get<ApiResponse<NewCreatorsResponse>>(
      `/explore/creators/new?${params.toString()}`
    );
    return response.data.data;
  },

  // Get creators by category
  async getCreatorsByCategory(
    categoryId: string,
    limit: number = 20,
    cursor?: string
  ): Promise<CreatorsByCategoryResponse> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (cursor) {
      params.append("cursor", cursor);
    }

    const url = `/explore/creators/by-category/${categoryId}?${params.toString()}`;
    console.log(`Making API request to: ${url}`);

    const response = await apiClient.get<ApiResponse<CreatorsByCategoryResponse>>(url);
    console.log(`API response received:`, response.data);
    return response.data.data;
  },
};