import { apiClient } from './client';

export interface FeedPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isMembershipOnly: boolean;
  isGotMembership: boolean;
  allowComments: boolean;
  images?: {
    url: string;
    isPublic: boolean;
  }[];
  textLength: number;
  imageCount: number;
  videoCount: number;
  commentCount: number;
  likeCount?: number;
  isLiked?: boolean;
  creator: {
    id: string;
    handle: string;
    name: string;
    avatar: string;
  };
}

export interface FeedResponse {
  success: boolean;
  data: FeedPost[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
    total: number;
  };
  message?: string;
}

export interface FeedQuery {
  page?: number;
  limit?: number;
  filter?: 'all' | 'membership' | 'public';
}

export const feedAPI = {
  /**
   * 사용자 맞춤 피드 조회 (로그인 필요)
   */
  async getFeed(query: FeedQuery = {}): Promise<FeedResponse> {
    try {
      const params = new URLSearchParams();
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.filter) params.append('filter', query.filter);

      const response = await apiClient.get(`/feed?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get feed:', error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, hasMore: false, total: 0 },
        message: '피드를 불러오는데 실패했습니다.',
      };
    }
  },

  /**
   * 공개 피드 조회 (로그인 불필요)
   */
  async getPublicFeed(query: FeedQuery = {}): Promise<FeedResponse> {
    try {
      const params = new URLSearchParams();
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await apiClient.get(`/feed/public?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get public feed:', error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, hasMore: false, total: 0 },
        message: '공개 피드를 불러오는데 실패했습니다.',
      };
    }
  },
};