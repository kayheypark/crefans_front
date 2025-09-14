export interface CreatorCategory {
  id: string;
  name: string;
  description: string;
  color_code: string;
  icon: string;
  sort_order: number;
}

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
  category?: CreatorCategory | null;
}
