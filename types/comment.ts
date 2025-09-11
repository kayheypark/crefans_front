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

export interface CreateCommentDto {
  posting_id: string;
  content: string;
  parent_id?: string;
  tagged_user_id?: string;
}

export interface UpdateCommentDto {
  content: string;
  tagged_user_id?: string;
}

export interface CommentListResponse {
  success: boolean;
  data: Comment[];
}

export interface CommentResponse {
  success: boolean;
  data: Comment;
}