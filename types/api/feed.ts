import { IPost } from "@/types/post";
export interface FeedResponse {
  success: boolean;
  data: IPost[];
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
  filter?: "all" | "membership" | "public";
}
