import { 
  CreatePostingDto, 
  UpdatePostingDto,
  PostingListResponse,
  PostingDetailResponse,
  CreatePostingResponse
} from '@/types/posting';
import { apiClient } from './client';
import { PostingLikeResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const postingApi = {
  // 포스팅 생성
  async createPosting(data: CreatePostingDto): Promise<CreatePostingResponse> {
    const response = await fetch(`${API_BASE_URL}/postings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '포스팅 생성에 실패했습니다.');
    }

    return response.json();
  },

  // 포스팅 목록 조회
  async getPostings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    is_membership?: boolean;
    user_sub?: string;
    search?: string;
  }): Promise<PostingListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.is_membership !== undefined) searchParams.append('is_membership', params.is_membership.toString());
    if (params?.user_sub) searchParams.append('user_sub', params.user_sub);
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/postings?${searchParams}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('포스팅 목록 조회에 실패했습니다.');
    }

    return response.json();
  },

  // 내 포스팅 목록 조회
  async getMyPostings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    is_membership?: boolean;
    search?: string;
  }): Promise<PostingListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.is_membership !== undefined) searchParams.append('is_membership', params.is_membership.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/postings/my/list?${searchParams}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('내 포스팅 목록 조회에 실패했습니다.');
    }

    return response.json();
  },

  // 포스팅 상세 조회
  async getPosting(id: number): Promise<PostingDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/postings/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('포스팅 조회에 실패했습니다.');
    }

    return response.json();
  },

  // 포스팅 수정
  async updatePosting(id: number, data: UpdatePostingDto): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/postings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '포스팅 수정에 실패했습니다.');
    }

    return response.json();
  },

  // 포스팅 삭제
  async deletePosting(id: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/postings/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '포스팅 삭제에 실패했습니다.');
    }

    return response.json();
  },

  // 포스팅 좋아요
  async likePosting(id: number): Promise<PostingLikeResponse> {
    try {
      const response = await apiClient.post(`/postings/${id}/like`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '좋아요 처리에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 포스팅 좋아요 취소
  async unlikePosting(id: number): Promise<PostingLikeResponse> {
    try {
      const response = await apiClient.delete(`/postings/${id}/like`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '좋아요 취소에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },
};