"use client";

import { useState, useEffect } from "react";
import { Button, Input, Avatar, Typography } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { commentAPI } from "@/lib/api/comment";
import { Comment, CreateCommentDto } from "@/types/comment";
import { formatRelativeDate } from "@/lib/utils/dateUtils";

const { Text } = Typography;

interface CommentListProps {
  postingId: number;
  allowComments: boolean;
  onCommentCountChange?: (count: number) => void;
  openReplies: { [key: number]: boolean };
  onToggleReplies: (postId: number) => void;
  onCommentInputClick: () => void;
  onCommentSubmit: (postId: number) => void;
  user: any;
  post: any;
  isMobile: boolean;
}

export default function CommentList({ 
  postingId, 
  allowComments, 
  onCommentCountChange,
  openReplies,
  onToggleReplies,
  onCommentInputClick,
  onCommentSubmit,
  user,
  post,
  isMobile
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [likedComments, setLikedComments] = useState<number[]>([]);

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

  const handleSubmitReply = async (parentId: number) => {
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

  const handleLikeComment = (commentId: number) => {
    setLikedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  if (!allowComments) {
    return null;
  }

  return (
    <>
      {/* 댓글 리스트 - 기존 하드코딩된 디자인과 정확히 동일하게 */}
      <div style={{ marginTop: 16, padding: isMobile ? "0 12px" : "0 16px" }}>
        {comments.map((comment) => (
          <div key={comment.id}>
            {/* 메인 댓글 */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <Avatar 
                size={32} 
                src={comment.author?.avatar || "/profile-90.png"} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text strong style={{ fontSize: 13, color: "#222" }}>
                    {comment.author?.name || "알 수 없음"}
                  </Text>
                  {comment.tagged_user && (
                    <Text type="secondary" style={{ fontSize: 13, color: "#888" }}>
                      @{comment.tagged_user.handle}
                    </Text>
                  )}
                  <Text style={{ fontSize: 13, marginLeft: 4 }}>
                    {comment.content}
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 2,
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {formatRelativeDate(comment.created_at)}
                  </Text>
                  {post.isGotMembership && (
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0, fontSize: 13, height: "auto" }}
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    >
                      답글 달기
                    </Button>
                  )}
                  <Button
                    type="link"
                    size="small"
                    style={{
                      padding: 0,
                      fontSize: 13,
                      height: "auto",
                      color: "#999",
                    }}
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    <HeartOutlined />
                  </Button>
                </div>

                {/* 답글 작성 폼 */}
                {replyTo === comment.id && (
                  <div style={{ marginTop: 8, marginLeft: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Avatar src={user?.avatar || "/profile-90.png"} size={28} />
                      <div style={{ flex: 1 }}>
                        <Input.TextArea
                          placeholder={`@${comment.author?.handle}님에게 답글 작성`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          autoSize={{ minRows: 1, maxRows: 3 }}
                          style={{ marginBottom: 8, border: "none" }}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                          <Button
                            size="small"
                            onClick={() => {
                              setReplyTo(null);
                              setReplyContent("");
                            }}
                          >
                            취소
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleSubmitReply(comment.id)}
                            loading={submitting}
                          >
                            답글 작성
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 대댓글 접기/펼치기 */}
                {comment.children && comment.children.length > 0 && (
                  <div style={{ marginLeft: 0, marginTop: 4 }}>
                    <Button
                      type="text"
                      size="small"
                      style={{ color: "#999", padding: 0, fontSize: 13 }}
                      onClick={() => onToggleReplies(postingId)}
                    >
                      ─── 답글 보기({comment.children.length}개)
                    </Button>
                  </div>
                )}

                {/* 대댓글 목록 (펼침 시) */}
                {openReplies[postingId] && comment.children && comment.children.length > 0 && (
                  <div style={{ marginTop: 8, marginLeft: 36 }}>
                    {comment.children.map((reply) => (
                      <div
                        key={reply.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <Avatar 
                          size={28} 
                          src={reply.author?.avatar || "/profile-90.png"} 
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Text strong style={{ fontSize: 14 }}>
                              {reply.author?.name || "알 수 없음"}
                            </Text>
                            {reply.tagged_user && (
                              <Text type="secondary" style={{ fontSize: 13, color: "#888" }}>
                                @{reply.tagged_user.handle}
                              </Text>
                            )}
                            <Text style={{ fontSize: 14 }}>
                              {reply.content}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginTop: 2,
                            }}
                          >
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {formatRelativeDate(reply.created_at)}
                            </Text>
                            {post.isGotMembership && (
                              <Button
                                type="link"
                                size="small"
                                style={{
                                  padding: 0,
                                  fontSize: 12,
                                  height: "auto",
                                }}
                                onClick={() => setReplyTo(reply.id)}
                              >
                                답글 달기
                              </Button>
                            )}
                            <Button
                              type="link"
                              size="small"
                              style={{
                                padding: 0,
                                fontSize: 12,
                                height: "auto",
                                color: "#999",
                              }}
                              onClick={() => handleLikeComment(reply.id)}
                            >
                              <HeartOutlined />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 댓글이 없을 때 */}
        {comments.length === 0 && !loading && (
          <div style={{ textAlign: "center", color: "#999", padding: "20px 0", fontSize: "12px" }}>
            첫 번째 댓글을 작성해보세요!
          </div>
        )}
      </div>

      {/* 답글 입력 UI - 기존 디자인과 동일 */}
      {post.isGotMembership && (
        <div
          style={{ marginTop: 16, padding: isMobile ? "0 12px" : "0 16px" }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <Avatar src={user?.avatar || "/profile-90.png"} size={32} />
            <div style={{ flex: 1 }}>
              <Input.TextArea
                key={postingId}
                placeholder={
                  user
                    ? "답글을 입력하세요"
                    : "로그인하고 답글을 작성해보세요"
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                autoSize={{ minRows: 1, maxRows: 3 }}
                style={{ marginBottom: 8, border: "none" }}
                onClick={onCommentInputClick}
                readOnly={!user}
              />
              {user && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="default"
                    onClick={() => {
                      handleSubmitComment();
                      onCommentSubmit(postingId);
                    }}
                    loading={submitting}
                  >
                    답글 작성
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}