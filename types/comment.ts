// Request DTOs (matching server exactly with snake_case)
export interface CreateCommentRequest {
  posting_id: string;
  content: string;
  parent_id?: string;
  tagged_user_id?: string;
}

export interface UpdateCommentRequest {
  content: string;
  tagged_user_id?: string;
}

// Response interfaces
export interface CommentAuthor {
  userId: string;
  handle: string;
  name: string;
  avatar: string;
}

export interface TaggedUser {
  userId: string;
  handle: string;
  name: string;
}

export interface Comment {
  id: string;
  posting_id: string;
  author_id: string;
  content: string;
  parent_id?: string;
  tagged_user_id?: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  author: CommentAuthor | null;
  taggedUser?: TaggedUser | null;
  children: Comment[];
  likeCount: number;
  isLiked: boolean;
}

// API Response types
export interface CommentListResponse {
  success: boolean;
  data: Comment[];
}

export interface CommentResponse {
  success: boolean;
  data: Comment;
}

// Legacy DTOs for backwards compatibility (deprecated, use Request types)
export type CreateCommentDto = CreateCommentRequest;
export type UpdateCommentDto = UpdateCommentRequest;