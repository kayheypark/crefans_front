import { IPost } from "@/types/post";
import "yet-another-react-lightbox/styles.css";
export interface PostProps {
  post: IPost;
  likedPosts: string[];
  expandedPosts: string[];
  relativeDatePosts: { [key: string]: boolean };
  openReplies: { [key: string]: boolean };
  onLike: (postId: string) => void;
  onToggleExpand: (postId: string) => void;
  onToggleDateType: (postId: string) => void;
  onToggleReplies: (postId: string) => void;
  onCommentInputClick: () => void;
  onCommentSubmit: (postId: string) => void;
  onShare: (postId: string) => void;
  onReport: (postId: string) => void;
  onEdit?: (postId: string) => void;
  formatDate: (date: string) => string;
  formatFullDate: (date: string) => string;
}
