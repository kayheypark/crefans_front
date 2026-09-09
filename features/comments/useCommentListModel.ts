"use client";
import type { ConfirmationRequest, Feedback } from "@/types/presentation";

import { CommentListProps } from "@/features/comments/types";
import { commentAPI } from "@/lib/api/comment";
import { Comment, CreateCommentDto } from "@/types/comment";
import { useEffect, useState } from "react";

export function useCommentListModel(
  {
    postingId,
    allowComments,
    onCommentCountChange,
    openReplies,
    onToggleReplies,
    onCommentInputClick,
    onCommentSubmit,
    user,
    post,
    isMobile,
  }: CommentListProps,
  {
    message,
    confirm,
  }: { message: Feedback; confirm: (request: ConfirmationRequest) => void },
) {
  const [comments, setComments] = useState<Comment[]>([]);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [newComment, setNewComment] = useState("");

  const [replyTo, setReplyTo] = useState<string | null>(null);

  const [replyContent, setReplyContent] = useState("");

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (postingId) {
      loadComments();
    }
  }, [postingId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getCommentsByPostingId(postingId);
      if (response.success) {
        setComments(response.data);
        // 댓글 개수 계산 (부모 댓글 + 답글)
        const totalCount = response.data.reduce((count, comment) => {
          return count + 1 + (comment.children?.length || 0);
        }, 0);
        onCommentCountChange?.(totalCount);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      setSubmitting(true);
      const commentData: CreateCommentDto = {
        posting_id: postingId,
        content: newComment.trim(),
      };

      const response = await commentAPI.createComment(commentData);
      if (response.success) {
        setNewComment("");
        loadComments();
      }
    } catch (error: any) {
      console.error("Failed to create comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    try {
      setSubmitting(true);
      const replyData: CreateCommentDto = {
        posting_id: postingId,
        content: replyContent.trim(),
        parent_id: parentId,
      };

      const response = await commentAPI.createComment(replyData);
      if (response.success) {
        setReplyContent("");
        setReplyTo(null);
        loadComments();
      }
    } catch (error: any) {
      console.error("Failed to create reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (
    commentId: string,
    currentIsLiked: boolean,
  ) => {
    if (!user) {
      message.warning("로그인이 필요합니다.");
      return;
    }

    try {
      if (currentIsLiked) {
        await commentAPI.unlikeComment(commentId);
        message.success("좋아요를 취소했습니다.");
      } else {
        await commentAPI.likeComment(commentId);
        message.success("좋아요를 눌렀습니다.");
      }
      // 댓글 목록을 새로고침하여 업데이트된 좋아요 상태를 반영
      loadComments();
    } catch (error: any) {
      console.error("Failed to toggle comment like:", error);
      const errorMessage =
        error.response?.data?.message || "좋아요 처리에 실패했습니다.";
      message.error(errorMessage);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    confirm({
      title: "댓글을 삭제하시겠습니까?",
      content: "삭제된 댓글은 복구할 수 없습니다.",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          const response = await commentAPI.deleteComment(commentId);
          if (response.success) {
            message.success("댓글이 삭제되었습니다.");
            loadComments();
          }
        } catch (error: any) {
          console.error("Failed to delete comment:", error);
          const errorMessage =
            error.response?.data?.message || "댓글 삭제에 실패했습니다.";
          message.error(errorMessage);
        }
      },
    });
  };

  const handleReportComment = (commentId: string) => {
    setSelectedCommentId(commentId);
    setReportModalOpen(true);
  };

  const handleReportSubmit = () => {
    // TODO: 실제 신고 기능 구현
    message.success("신고가 접수되었습니다.");
    setReportModalOpen(false);
    setSelectedCommentId(null);
  };

  return {
    comments,
    loading,
    submitting,
    newComment,
    setNewComment,
    replyTo,
    setReplyTo,
    replyContent,
    setReplyContent,
    reportModalOpen,
    setReportModalOpen,
    setSelectedCommentId,
    handleSubmitComment,
    handleSubmitReply,
    handleLikeComment,
    handleDeleteComment,
    handleReportComment,
    handleReportSubmit,
  };
}
