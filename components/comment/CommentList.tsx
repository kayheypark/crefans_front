"use client";

import { useState, useEffect } from "react";
import { List, Avatar, Button, Input, message, Dropdown, Modal, AutoComplete } from "antd";
import { 
  MessageOutlined, 
  MoreOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { commentAPI } from "@/lib/api/comment";
import { Comment, CreateCommentDto, UpdateCommentDto } from "@/types/comment";
import { formatRelativeDate } from "@/lib/utils/dateUtils";

const { TextArea } = Input;

interface CommentListProps {
  postingId: number;
  allowComments: boolean;
}

export default function CommentList({ postingId, allowComments }: CommentListProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

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
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
      message.error("댓글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      message.warning("로그인이 필요합니다.");
      return;
    }

    if (!newComment.trim()) {
      message.warning("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const commentData: CreateCommentDto = {
        posting_id: postingId,
        content: newComment.trim(),
      };

      const response = await commentAPI.createComment(commentData);
      if (response.success) {
        message.success("댓글이 작성되었습니다.");
        setNewComment("");
        loadComments();
      }
    } catch (error: any) {
      console.error("Failed to create comment:", error);
      const errorMessage = error.response?.data?.message || "댓글 작성에 실패했습니다.";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!user) {
      message.warning("로그인이 필요합니다.");
      return;
    }

    if (!replyContent.trim()) {
      message.warning("답글 내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const replyData: CreateCommentDto = {
        posting_id: postingId,
        content: replyContent.trim(),
        parent_id: parentId,
      };

      const response = await commentAPI.createComment(replyData);
      if (response.success) {
        message.success("답글이 작성되었습니다.");
        setReplyContent("");
        setReplyTo(null);
        loadComments();
      }
    } catch (error: any) {
      console.error("Failed to create reply:", error);
      const errorMessage = error.response?.data?.message || "답글 작성에 실패했습니다.";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) {
      message.warning("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const updateData: UpdateCommentDto = {
        content: editContent.trim(),
      };

      const response = await commentAPI.updateComment(commentId, updateData);
      if (response.success) {
        message.success("댓글이 수정되었습니다.");
        setEditingComment(null);
        setEditContent("");
        loadComments();
      }
    } catch (error: any) {
      console.error("Failed to update comment:", error);
      const errorMessage = error.response?.data?.message || "댓글 수정에 실패했습니다.";
      message.error(errorMessage);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    Modal.confirm({
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
          const errorMessage = error.response?.data?.message || "댓글 삭제에 실패했습니다.";
          message.error(errorMessage);
        }
      },
    });
  };

  const getCommentActions = (comment: Comment) => {
    const isOwner = user?.attributes?.sub === comment.author_id;
    const actions: React.ReactNode[] = [];

    // 답글 버튼
    if (allowComments && !comment.parent_id) {
      actions.push(
        <Button
          key="reply"
          type="text"
          size="small"
          icon={<MessageOutlined />}
          onClick={() => {
            setReplyTo(comment.id);
            setReplyContent("");
          }}
        >
          답글
        </Button>
      );
    }

    // 더보기 메뉴 (작성자만)
    if (isOwner) {
      const menuItems = [
        {
          key: "edit",
          label: "수정",
          icon: <EditOutlined />,
          onClick: () => {
            setEditingComment(comment.id);
            setEditContent(comment.content);
          },
        },
        {
          key: "delete",
          label: "삭제",
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => handleDeleteComment(comment.id),
        },
      ];

      actions.push(
        <Dropdown
          key="more"
          menu={{ items: menuItems }}
          trigger={["click"]}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      );
    }

    return actions;
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <List.Item
      key={comment.id}
      actions={getCommentActions(comment)}
      style={{
        paddingLeft: isReply ? 40 : 0,
        backgroundColor: isReply ? "#fafafa" : "transparent",
      }}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            src={comment.author?.avatar}
            size={isReply ? 32 : 40}
          >
            {comment.author?.name?.[0]}
          </Avatar>
        }
        title={
          <div>
            <strong>{comment.author?.name || "알 수 없음"}</strong>
            <span style={{ marginLeft: 8, color: "#999", fontSize: 12 }}>
              @{comment.author?.handle}
            </span>
            <span style={{ marginLeft: 8, color: "#999", fontSize: 12 }}>
              {formatRelativeDate(comment.created_at)}
            </span>
          </div>
        }
        description={
          editingComment === comment.id ? (
            <div style={{ marginTop: 8 }}>
              <TextArea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 6 }}
                maxLength={1000}
              />
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleEditComment(comment.id)}
                  loading={submitting}
                >
                  저장
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent("");
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 4 }}>
              {comment.tagged_user && (
                <span style={{ color: "#1890ff", marginRight: 4 }}>
                  @{comment.tagged_user.handle}
                </span>
              )}
              {comment.content}
              {replyTo === comment.id && (
                <div style={{ marginTop: 12 }}>
                  <TextArea
                    placeholder={`@${comment.author?.handle}님에게 답글 작성`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    maxLength={1000}
                  />
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleSubmitReply(comment.id)}
                      loading={submitting}
                    >
                      답글 작성
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent("");
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        }
      />
    </List.Item>
  );

  if (!allowComments) {
    return (
      <div style={{ padding: "16px 0", textAlign: "center", color: "#999" }}>
        댓글 작성이 허용되지 않은 게시물입니다.
      </div>
    );
  }

  return (
    <div>
      {/* 새 댓글 작성 */}
      {user && (
        <div style={{ marginBottom: 16 }}>
          <TextArea
            placeholder="댓글을 작성해보세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={1000}
          />
          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#999", fontSize: 12 }}>
              {newComment.length}/1000
            </span>
            <div>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadComments}
                style={{ marginRight: 8 }}
              >
                새로고침
              </Button>
              <Button
                type="primary"
                onClick={handleSubmitComment}
                loading={submitting}
                disabled={!newComment.trim()}
              >
                댓글 작성
              </Button>
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div style={{ marginBottom: 16, textAlign: "center", padding: 16, backgroundColor: "#fafafa", borderRadius: 8 }}>
          <span style={{ color: "#999" }}>
            댓글을 작성하려면 로그인해주세요.
          </span>
        </div>
      )}

      {/* 댓글 목록 */}
      <List
        loading={loading}
        dataSource={comments}
        locale={{
          emptyText: "첫 번째 댓글을 작성해보세요!"
        }}
        renderItem={(comment) => (
          <div key={comment.id}>
            {renderComment(comment)}
            {comment.children && comment.children.length > 0 && (
              <div style={{ marginLeft: 24 }}>
                {comment.children.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}