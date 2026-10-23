"use client";
import { message as uiMessage, Modal as UiModal } from "antd";

import { CommentListProps } from "@/features/comments/types";
import { useCommentListModel } from "@/features/comments/useCommentListModel";
import { formatRelativeDate } from "@/lib/utils/dateUtils";
import { Comment } from "@/types/comment";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  HeartFilled,
  HeartOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Input, Modal, Typography } from "antd";

const { Text } = Typography;

export default function CommentList(props: CommentListProps) {
  const model = useCommentListModel(props, {
    message: uiMessage,
    confirm: (request) => UiModal.confirm(request),
  });
  return <CommentListView {...props} model={model} />;
}

function CommentListView({
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
  model,
}: CommentListProps & { model: ReturnType<typeof useCommentListModel> }) {
  const {
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
  } = model;

  if (!allowComments) {
    return null;
  }

  const getCommentMoreMenu = (comment: Comment) => {
    const isOwner = user?.attributes?.sub === comment.author_id;
    const items = [];

    if (isOwner) {
      items.push({
        key: "delete",
        label: "삭제",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteComment(comment.id),
      });
    } else {
      items.push({
        key: "report",
        label: "신고하기",
        icon: <ExclamationCircleOutlined />,
        danger: true,
        onClick: () => handleReportComment(comment.id),
      });
    }

    return { items };
  };

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
                src={
                  comment.is_deleted
                    ? "/profile-90.png"
                    : comment.author?.avatar || "/profile-90.png"
                }
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text strong style={{ fontSize: 13, color: "#222" }}>
                    {comment.is_deleted
                      ? "알 수 없음"
                      : comment.author?.name || "알 수 없음"}
                  </Text>
                  {comment.taggedUser && (
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, color: "#888" }}
                    >
                      @{comment.taggedUser.handle}
                    </Text>
                  )}
                  <Text
                    style={{
                      fontSize: 13,
                      marginLeft: 4,
                      color: comment.is_deleted ? "#999" : "inherit",
                      fontStyle: comment.is_deleted ? "italic" : "normal",
                    }}
                  >
                    {comment.is_deleted
                      ? "삭제된 댓글입니다."
                      : comment.content}
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
                  {post.isGotMembership && !comment.is_deleted && (
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0, fontSize: 13, height: "auto" }}
                      onClick={() =>
                        setReplyTo(replyTo === comment.id ? null : comment.id)
                      }
                    >
                      답글 달기
                    </Button>
                  )}
                  {!comment.is_deleted && (
                    <>
                      <Button
                        type="link"
                        size="small"
                        style={{
                          padding: 0,
                          fontSize: 13,
                          height: "auto",
                          color: comment.isLiked ? "#ff4d4f" : "#999",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        onClick={() =>
                          handleLikeComment(comment.id, comment.isLiked)
                        }
                      >
                        {comment.isLiked ? <HeartFilled /> : <HeartOutlined />}
                        {comment.likeCount > 0 && (
                          <span>{comment.likeCount}</span>
                        )}
                      </Button>
                      <Dropdown
                        menu={getCommentMoreMenu(comment)}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <Button
                          type="link"
                          size="small"
                          style={{
                            padding: 0,
                            fontSize: 13,
                            height: "auto",
                            color: "#999",
                          }}
                        >
                          <MoreOutlined />
                        </Button>
                      </Dropdown>
                    </>
                  )}
                </div>

                {/* 답글 작성 폼 */}
                {replyTo === comment.id && (
                  <div style={{ marginTop: 8, marginLeft: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <Avatar
                        src={user?.avatar || "/profile-90.png"}
                        size={28}
                      />
                      <div style={{ flex: 1 }}>
                        <Input.TextArea
                          placeholder={
                            comment.is_deleted
                              ? "답글 작성"
                              : `@${comment.author?.handle}님에게 답글 작성`
                          }
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          autoSize={{ minRows: 1, maxRows: 3 }}
                          style={{ marginBottom: 8, border: "none" }}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                          }}
                        >
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
                {openReplies[postingId] &&
                  comment.children &&
                  comment.children.length > 0 && (
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
                            src={
                              reply.is_deleted
                                ? "/profile-90.png"
                                : reply.author?.avatar || "/profile-90.png"
                            }
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
                                {reply.is_deleted
                                  ? "알 수 없음"
                                  : reply.author?.name || "알 수 없음"}
                              </Text>
                              {reply.taggedUser && (
                                <Text
                                  type="secondary"
                                  style={{ fontSize: 13, color: "#888" }}
                                >
                                  @{reply.taggedUser.handle}
                                </Text>
                              )}
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: reply.is_deleted ? "#999" : "inherit",
                                  fontStyle: reply.is_deleted
                                    ? "italic"
                                    : "normal",
                                }}
                              >
                                {reply.is_deleted
                                  ? "삭제된 댓글입니다."
                                  : reply.content}
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
                              {!reply.is_deleted && (
                                <>
                                  <Button
                                    type="link"
                                    size="small"
                                    style={{
                                      padding: 0,
                                      fontSize: 12,
                                      height: "auto",
                                      color: reply.isLiked ? "#ff4d4f" : "#999",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                    onClick={() =>
                                      handleLikeComment(reply.id, reply.isLiked)
                                    }
                                  >
                                    {reply.isLiked ? (
                                      <HeartFilled />
                                    ) : (
                                      <HeartOutlined />
                                    )}
                                    {reply.likeCount > 0 && (
                                      <span>{reply.likeCount}</span>
                                    )}
                                  </Button>
                                  <Dropdown
                                    menu={getCommentMoreMenu(reply)}
                                    trigger={["click"]}
                                    placement="bottomRight"
                                  >
                                    <Button
                                      type="link"
                                      size="small"
                                      style={{
                                        padding: 0,
                                        fontSize: 12,
                                        height: "auto",
                                        color: "#999",
                                      }}
                                    >
                                      <MoreOutlined />
                                    </Button>
                                  </Dropdown>
                                </>
                              )}
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
          <div
            style={{
              textAlign: "center",
              color: "#999",
              padding: "20px 0",
              fontSize: "12px",
            }}
          >
            첫 번째 댓글을 작성해보세요!
          </div>
        )}
      </div>

      {/* 답글 입력 UI - 기존 디자인과 동일 */}
      {post.isGotMembership && (
        <div style={{ marginTop: 16, padding: isMobile ? "0 12px" : "0 16px" }}>
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
                  user ? "답글을 입력하세요" : "로그인하고 답글을 작성해보세요"
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

      {/* 신고하기 모달 */}
      <Modal
        title="댓글 신고하기"
        open={reportModalOpen}
        onCancel={() => {
          setReportModalOpen(false);
          setSelectedCommentId(null);
        }}
        onOk={handleReportSubmit}
        okText="신고하기"
        cancelText="취소"
        okType="danger"
      >
        <div style={{ padding: "20px 0" }}>
          <p>이 댓글을 신고하시겠습니까?</p>
          <p style={{ color: "#666", fontSize: "14px" }}>
            신고 사유는 추후 선택할 수 있도록 업데이트될 예정입니다.
          </p>
        </div>
      </Modal>
    </>
  );
}
