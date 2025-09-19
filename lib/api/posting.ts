import {
  CreatePostingRequest,
  UpdatePostingRequest,
  PostingQueryRequest,
  PostingListResponse,
  PostingDetailResponse,
  CreatePostingResponse,
  UpdatePostingResponse
} from '@/types/posting';
import { apiClient } from './client';
import { PostingLikeResponse } from '@/types/api';
import { API_BASE_URL } from './config';

export const postingApi = {
  // 포스팅 생성
  async createPosting(data: CreatePostingRequest): Promise<CreatePostingResponse> {
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
  async getPostings(params?: PostingQueryRequest): Promise<PostingListResponse> {
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
  async getMyPostings(params?: Omit<PostingQueryRequest, 'user_sub'>): Promise<PostingListResponse> {
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
  async getPosting(id: string): Promise<PostingDetailResponse> {
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
  async updatePosting(id: string, data: UpdatePostingRequest): Promise<UpdatePostingResponse> {
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
  async deletePosting(id: string): Promise<{ success: boolean; message: string }> {
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
  async likePosting(id: string): Promise<PostingLikeResponse> {
    try {
      const response = await apiClient.post(`/postings/${id}/like`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '좋아요 처리에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 포스팅 좋아요 취소
  async unlikePosting(id: string): Promise<PostingLikeResponse> {
    try {
      const response = await apiClient.delete(`/postings/${id}/like`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '좋아요 취소에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },
};