export interface BoardPost {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  category: string;
  created_at: string;
  updated_at?: string;
  published_at: string;
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
