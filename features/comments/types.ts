export interface CommentListProps {
  postingId: string;
  allowComments: boolean;
  onCommentCountChange?: (count: number) => void;
  openReplies: { [key: string]: boolean };
  onToggleReplies: (postId: string) => void;
  onCommentInputClick: () => void;
  onCommentSubmit: (postId: string) => void;
  user: any;
  post: any;
  isMobile: boolean;
}
