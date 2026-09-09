import { ApiResponse } from "@/types/api";
import type {
  CreatorCategory,
  CreatorsByCategoryResponse,
  NewCreatorsResponse,
} from "@/types/api/explore";
import { apiClient } from "./client";
export type {
  Creator,
  CreatorCategory,
  CreatorsByCategoryResponse,
  NewCreatorsResponse,
} from "@/types/api/explore";

// API Functions
export const exploreAPI = {
  // Get all creator categories
  async getCategories(): Promise<CreatorCategory[]> {
    const response = await apiClient.get<ApiResponse<CreatorCategory[]>>(
      "/explore/categories",
    );
    return response.data.data;
  },

  // Get new creators
  async getNewCreators(
    limit: number = 20,
    cursor?: string,
  ): Promise<NewCreatorsResponse> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await apiClient.get<ApiResponse<NewCreatorsResponse>>(
      `/explore/creators/new?${params.toString()}`,
    );
    return response.data.data;
  },

  // Get creators by category
  async getCreatorsByCategory(
    categoryId: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<CreatorsByCategoryResponse> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (cursor) {
      params.append("cursor", cursor);
    }

    const url = `/explore/creators/by-category/${categoryId}?${params.toString()}`;
    console.log(`Making API request to: ${url}`);

    const response =
      await apiClient.get<ApiResponse<CreatorsByCategoryResponse>>(url);
    console.log(`API response received:`, response.data);
    return response.data.data;
  },
};
