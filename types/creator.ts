export interface Creator {
  id: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
  createdAt: string;
  updatedAt: string;
}
