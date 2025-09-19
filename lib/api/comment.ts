import axios from "axios";
import { getApiUrl } from "@/utils/env";
import {
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentListResponse,
  CommentResponse,
  // Legacy DTOs for compatibility
  CreateCommentDto,
  UpdateCommentDto
} from "@/types/comment";
import { CommentLikeResponse } from '@/types/api';

export const commentAPI = {
  // 댓글 생성
  createComment: async (commentData: CreateCommentRequest): Promise<CommentResponse> => {
    const response = await axios.post(
      `${getApiUrl()}/comments`,
      commentData,
      { withCredentials: true }
    );
    return response.data;
  },

  // 포스팅의 댓글 목록 조회
  getCommentsByPostingId: async (postingId: string): Promise<CommentListResponse> => {
    const response = await axios.get(
      `${getApiUrl()}/comments/posting/${postingId}`,
      { withCredentials: true }
    );
    return response.data;
  },

  // 댓글 수정
  updateComment: async (commentId: string, commentData: UpdateCommentRequest): Promise<CommentResponse> => {
    const response = await axios.put(
      `${getApiUrl()}/comments/${commentId}`,
      commentData,
      { withCredentials: true }
    );
    return response.data;
  },

  // 댓글 삭제
  deleteComment: async (commentId: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(
      `${getApiUrl()}/comments/${commentId}`,
      { withCredentials: true }
    );
    return response.data;
  },

  // 댓글 좋아요
  likeComment: async (commentId: string): Promise<CommentLikeResponse> => {
    const response = await axios.post(
      `${getApiUrl()}/comments/${commentId}/like`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  // 댓글 좋아요 취소
  unlikeComment: async (commentId: string): Promise<CommentLikeResponse> => {
    const response = await axios.delete(
      `${getApiUrl()}/comments/${commentId}/like`,
      { withCredentials: true }
    );
    return response.data;
  },
};