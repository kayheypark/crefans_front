"use client";
import { message as uiMessage } from "antd";

import LoginModal from "@/components/modals/LoginModal";
import ReportModal from "@/components/modals/ReportModal";
import Post from "@/components/post/Post";
import { usePostPageModel } from "@/features/post-id/usePostPageModel";
import { formatFullDate } from "@/lib/utils/dateUtils";
import { getPostUrl } from "@/utils/env";
import {
  ArrowLeftOutlined,
  FacebookOutlined,
  InstagramOutlined,
  LinkOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import {
  Button,
  Empty,
  Input,
  Layout,
  message,
  Modal,
  Space,
  Spin,
} from "antd";

export default function PostPage() {
  const model = usePostPageModel({ message: uiMessage });
  return <PostPageView model={model} />;
}

function PostPageView({
  model,
}: {
  model: ReturnType<typeof usePostPageModel>;
}) {
  const {
    router,
    isMobile,
    isTablet,
    post,
    loading,
    error,
    isShareModalVisible,
    setIsShareModalVisible,
    isReportModalVisible,
    setIsReportModalVisible,
    isLoginModalOpen,
    setIsLoginModalOpen,
    selectedPostId,
    likedPosts,
    expandedPosts,
    relativeDatePosts,
    openReplies,
    handleLike,
    togglePostExpand,
    toggleDateType,
    toggleReplies,
    handleCommentInputClick,
    handleCommentSubmit,
    handleSharePost,
    handleReportPost,
    handleShare,
    handleReport,
    formatDate,
    transformPostForComponent,
  } = model;

  if (loading) {
    return (
      <Layout
        style={{
          width: isMobile ? "100%" : isTablet ? "90%" : "800px",
          margin: "0 auto",
          padding: isMobile ? "16px" : "20px",
          background: "transparent",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout
        style={{
          width: isMobile ? "100%" : isTablet ? "90%" : "800px",
          margin: "0 auto",
          padding: isMobile ? "16px" : "20px",
          background: "transparent",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Empty
          description={error || "포스팅을 찾을 수 없습니다."}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Layout>
    );
  }

  return (
    <Layout
      style={{
        width: isMobile ? "100%" : isTablet ? "90%" : "800px",
        margin: "0 auto",
        padding: isMobile ? "16px" : "20px",
        background: "transparent",
        minHeight: "100vh",
      }}
    >
      {/* 뒤로가기 버튼 */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            color: "#666",
            padding: "8px 0",
          }}
        >
          <ArrowLeftOutlined />
          뒤로가기
        </button>
      </div>

      {/* 포스팅 */}
      <Post
        post={transformPostForComponent(post)}
        likedPosts={likedPosts}
        expandedPosts={expandedPosts}
        relativeDatePosts={relativeDatePosts}
        openReplies={openReplies}
        onLike={handleLike}
        onToggleExpand={togglePostExpand}
        onToggleDateType={toggleDateType}
        onToggleReplies={toggleReplies}
        onCommentInputClick={handleCommentInputClick}
        onCommentSubmit={handleCommentSubmit}
        onShare={handleSharePost}
        onReport={handleReportPost}
        formatDate={formatDate}
        formatFullDate={formatFullDate}
      />

      {/* 공유하기 모달 */}
      <Modal
        title="공유하기"
        open={isShareModalVisible}
        onCancel={() => setIsShareModalVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ textAlign: "center" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Input
                value={getPostUrl(selectedPostId || "")}
                readOnly
                suffix={
                  <Button
                    type="text"
                    icon={<LinkOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        getPostUrl(selectedPostId || ""),
                      );
                      message.success("링크가 복사되었습니다.");
                    }}
                  />
                }
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "24px",
              }}
            >
              <Button
                type="text"
                icon={
                  <FacebookOutlined
                    style={{ fontSize: "24px", color: "#1877F2" }}
                  />
                }
                onClick={() => handleShare("Facebook")}
              />
              <Button
                type="text"
                icon={
                  <TwitterOutlined
                    style={{ fontSize: "24px", color: "#1DA1F2" }}
                  />
                }
                onClick={() => handleShare("Twitter")}
              />
              <Button
                type="text"
                icon={
                  <InstagramOutlined
                    style={{ fontSize: "24px", color: "#E4405F" }}
                  />
                }
                onClick={() => handleShare("Instagram")}
              />
            </div>
          </Space>
        </div>
      </Modal>

      {/* 신고하기 모달 */}
      <ReportModal
        open={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        onSubmit={handleReport}
      />

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </Layout>
  );
}
