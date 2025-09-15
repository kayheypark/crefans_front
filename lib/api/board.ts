import { apiClient } from "./client";

export interface BoardPost {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  category: string;
  created_at: string;
  updated_at?: string;
  views: number;
  is_important: boolean;
  is_published: boolean;
  author: string;
  is_deleted?: boolean;
  deleted_at?: string;
}

export interface BoardListResponse {
  success: boolean;
  message: string;
  data: {
    posts: BoardPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface BoardDetailResponse {
  success: boolean;
  message: string;
  data: BoardPost;
}

export const boardApi = {
  // 게시글 목록 조회
  getPosts: async (params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<BoardListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/board?${queryParams}`);
    return response.data;
  },

  // 게시글 상세 조회
  getPost: async (id: string): Promise<BoardDetailResponse> => {
    const response = await apiClient.get(`/board/${id}`);
    return response.data;
  },

  // 게시글 조회수 증가
  incrementViews: async (id: string): Promise<void> => {
    await apiClient.patch(`/board/${id}/views`);
  },
};