"use client";
import { message as uiMessage } from "antd";

import FeedFilter from "@/components/common/FeedFilter";
import LoginModal from "@/components/modals/LoginModal";
import ReportModal from "@/components/modals/ReportModal";
import Post from "@/components/post/Post";
import { useFeedModel } from "@/features/feed/useFeedModel";
import { getPostUrl } from "@/utils/env";
import {
  ExclamationCircleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  LinkOutlined,
  ShareAltOutlined,
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
import InfiniteScroll from "react-infinite-scroll-component";

export default function Feed() {
  const model = useFeedModel({ message: uiMessage });
  return <FeedView model={model} />;
}

function FeedView({ model }: { model: ReturnType<typeof useFeedModel> }) {
  const {
    router,
    searchParams,
    isMobile,
    isTablet,
    hasMore,
    likedPosts,
    isShareModalVisible,
    setIsShareModalVisible,
    isReportModalVisible,
    setIsReportModalVisible,
    selectedPostId,
    setSelectedPostId,
    isLoginModalOpen,
    setIsLoginModalOpen,
    expandedPosts,
    relativeDatePosts,
    openReplies,
    filter,
    setFilter,
    loadMoreData,
    formatDate,
    handleLike,
    togglePostExpand,
    toggleDateType,
    toggleReplies,
    handleCommentInputClick,
    handleCommentSubmit,
    formatFullDate,
    handleShare,
    handleSharePost,
    handleReportPost,
    handleReport,
    transformPostForComponent,
    uniquePosts,
  } = model;

  // 펼치기 메뉴 아이템
  const getMoreMenu = (postId: string) => ({
    items: [
      {
        key: "share",
        icon: <ShareAltOutlined />,
        label: "공유하기",
        onClick: () => {
          setSelectedPostId(postId);
          setIsShareModalVisible(true);
        },
      },
      {
        key: "report",
        icon: <ExclamationCircleOutlined />,
        label: "신고하기",
        danger: true,
        onClick: () => {
          setSelectedPostId(postId);
          setIsReportModalVisible(true);
        },
      },
    ],
  });

  return (
    <>
      <Layout
        style={{
          width: isMobile ? "100%" : isTablet ? "90%" : "800px",
          margin: "0 auto",
          padding: isMobile ? "16px" : "20px",
          background: "transparent",
        }}
      >
        {/* 필터 */}
        <FeedFilter
          filter={filter}
          onFilterChange={(newFilter) => {
            setFilter(newFilter as "all" | "membership" | "public");
            const params = new URLSearchParams(searchParams.toString());
            params.set("feedFilter", newFilter);
            router.push(`?${params.toString()}`);
          }}
          filters={[
            { key: "all", label: "모든 포스팅" },
            { key: "membership", label: "멤버십 전용" },
            { key: "public", label: "공개" },
          ]}
          type="explore"
          style={{ marginBottom: 30 }}
        />
      </Layout>
      <Layout>
        {/* 피드 컨텐츠 */}
        <div style={{ marginTop: 0 }}>
          <InfiniteScroll
            dataLength={uniquePosts.length}
            next={loadMoreData}
            hasMore={hasMore}
            loader={
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
              </div>
            }
            endMessage={
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Empty
                  description="더 이상 확인할 게시글이 없습니다."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            }
          >
            {uniquePosts.map((post) => (
              <Post
                key={post.id}
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
            ))}
          </InfiniteScroll>
        </div>

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

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </Layout>
    </>
  );
}
