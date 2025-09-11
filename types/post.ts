import { MediaResponse } from './posting';

export interface IPost {
  id: number;
  creator: {
    id: string | number;
    handle: string;
    name: string;
    avatar: string;
  };
  title: string;
  content: string;
  isMembershipOnly: boolean;
  isGotMembership: boolean;
  allowComments?: boolean;
  createdAt: string;
  images?: {
    url: string;
    width?: number;
    height?: number;
    isPublic?: boolean;
  }[];
  media?: MediaResponse[];
  textLength: number;
  imageCount: number;
  videoCount: number;
  commentCount: number;
  likeCount?: number;
  isLiked?: boolean;
  hasAccess?: boolean;
  membershipLevel?: number;
  allowIndividualPurchase?: boolean;
  individualPurchasePrice?: number;
}

export interface IPostImage {
  url: string;
  width?: number;
  height?: number;
  isPublic?: boolean;
}

export interface IPostMedia {
  id: string;
  fileName: string;
  originalUrl: string;
  type: "IMAGE" | "VIDEO";
  processingStatus: "COMPLETED" | "PROCESSING" | "FAILED";
  thumbnailUrls?: string[] | null;
}

export interface IPostProps {
  post: IPost;
  onLike?: (postId: number, isLiked: boolean) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  showActions?: boolean;
  className?: string;
}