import { PostingLikeResponse } from "@/types/api";
import {
  CreatePostingRequest,
  CreatePostingResponse,
  PostingDetailResponse,
  PostingListResponse,
  PostingQueryRequest,
  UpdatePostingRequest,
  UpdatePostingResponse,
} from "@/types/posting";
import type { AxiosResponse } from "axios";
import { apiClient } from "./client";

async function postingRequest<T>(
  request: Promise<AxiosResponse<T>>,
  fallback: string,
  useServerMessage = false,
): Promise<T> {
  try {
    return (await request).data;
  } catch (error: any) {
    throw new Error(
      (useServerMessage && error.response?.data?.message) || fallback,
    );
  }
}

export const postingApi = {
  // 포스팅 생성
  async createPosting(
    data: CreatePostingRequest,
  ): Promise<CreatePostingResponse> {
    return postingRequest(
      apiClient.post("/postings", data),
      "포스팅 생성에 실패했습니다.",
      true,
    );
  },

  // 포스팅 목록 조회
  async getPostings(
    params?: PostingQueryRequest,
  ): Promise<PostingListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.is_membership !== undefined)
      searchParams.append("is_membership", params.is_membership.toString());
    if (params?.user_sub) searchParams.append("user_sub", params.user_sub);
    if (params?.search) searchParams.append("search", params.search);

    return postingRequest(
      apiClient.get(`/postings?${searchParams}`),
      "포스팅 목록 조회에 실패했습니다.",
      false,
    );
  },

  // 내 포스팅 목록 조회
  async getMyPostings(
    params?: Omit<PostingQueryRequest, "user_sub">,
  ): Promise<PostingListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.is_membership !== undefined)
      searchParams.append("is_membership", params.is_membership.toString());
    if (params?.search) searchParams.append("search", params.search);

    return postingRequest(
      apiClient.get(`/postings/my/list?${searchParams}`),
      "내 포스팅 목록 조회에 실패했습니다.",
      false,
    );
  },

  // 포스팅 상세 조회
  async getPosting(id: string): Promise<PostingDetailResponse> {
    return postingRequest(
      apiClient.get(`/postings/${id}`),
      "포스팅 조회에 실패했습니다.",
      false,
    );
  },

  // 포스팅 수정
  async updatePosting(
    id: string,
    data: UpdatePostingRequest,
  ): Promise<UpdatePostingResponse> {
    return postingRequest(
      apiClient.patch(`/postings/${id}`, data),
      "포스팅 수정에 실패했습니다.",
      true,
    );
  },

  // 포스팅 삭제
  async deletePosting(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    return postingRequest(
      apiClient.delete(`/postings/${id}`),
      "포스팅 삭제에 실패했습니다.",
      true,
    );
  },

  // 포스팅 좋아요
  async likePosting(id: string): Promise<PostingLikeResponse> {
    try {
      const response = await apiClient.post(`/postings/${id}/like`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "좋아요 처리에 실패했습니다.";
      throw new Error(errorMessage);
    }
  },

  // 포스팅 좋아요 취소
  async unlikePosting(id: string): Promise<PostingLikeResponse> {
    try {
      const response = await apiClient.delete(`/postings/${id}/like`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "좋아요 취소에 실패했습니다.";
      throw new Error(errorMessage);
    }
  },
};
