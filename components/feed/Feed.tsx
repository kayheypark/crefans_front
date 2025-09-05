"use client";

import React, { useState, useEffect, useRef, MouseEvent } from "react";
import {
  Typography,
  Card,
  Avatar,
  Tag,
  Space,
  Spin,
  Empty,
  Button,
  Input,
  Divider,
  Dropdown,
  Menu,
  Modal,
  Radio,
  Form,
  message,
  Tabs,
  Image as AntdImageComponent,
  Watermark,
  Layout,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  CrownOutlined,
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  ShareAltOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  PictureOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/modals/LoginModal";
import ReportModal from "@/components/modals/ReportModal";
import Post from "@/components/post/Post";
import { useRouter, useSearchParams } from "next/navigation";
import { useResponsive } from "@/hooks/useResponsive";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import Spacings from "@/lib/constants/spacings";
import FeedFilter from "@/components/common/FeedFilter";

const { Title, Paragraph, Text } = Typography;

interface Post {
  id: number;
  creator: {
    id: number;
    handle: string;
    name: string;
    avatar: string;
  };
  title: string;
  content: string;
  isMembershipOnly: boolean;
  isGotMembership: boolean;
  createdAt: string;
  images?: {
    url: string;
    width?: number;
    height?: number;
    isPublic?: boolean;
  }[];
  textLength: number;
  imageCount: number;
  videoCount: number;
}

export default function Feed() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
  const [relativeDatePosts, setRelativeDatePosts] = useState<{
    [key: number]: boolean;
  }>({});
  const [filter, setFilter] = useState<"all" | "membership" | "public">(
    (searchParams.get("feedFilter") as "all" | "membership" | "public") || "all"
  );
  const [coverProgress, setCoverProgress] = useState<{ [key: number]: number }>(
    {}
  );
  const [openReplies, setOpenReplies] = useState<{ [key: number]: boolean }>(
    {}
  );

  //무단 복제금지 문구
  const noCopyGuideText =
    "crefans에 등록된 모든 포스팅 콘텐츠의 캡쳐 및 배포/재배포는 이용약관과 관련 법령에 의거하여 엄격히 금지되어있고, 민/형사상 처벌의 대상이 됩니다.";

  // JSON에서 데이터 fetch
  const fetchFeedData = async (page: number, pageSize: number) => {
    const res = await fetch("/mock/feed.json");
    const apiResponse = await res.json();
    const data: Post[] = apiResponse.data;
    // 페이지네이션 흉내
    return data.slice((page - 1) * pageSize, page * pageSize);
  };

  const loadMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const newPosts = await fetchFeedData(page, pageSize);
    setPosts((prev) => [...prev, ...newPosts]);
    if (newPosts.length < pageSize) {
      setHasMore(false);
    } else {
      setPage((prev) => prev + 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMoreData();
    // eslint-disable-next-line
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  };

  const handleLike = (postId: number) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleCommentSubmit = (postId: number) => {
    // TODO: 답글 제출 로직 구현
    message.success("답글이 작성되었습니다.");
  };

  const handleCommentInputClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  const togglePostExpand = (postId: number) => {
    setExpandedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleReplies = (postId: number) => {
    setOpenReplies((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // 날짜 표기 토글
  const toggleDateType = (postId: number) => {
    setRelativeDatePosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // 정확한 날짜 포맷 함수
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  // 펼치기 메뉴 아이템
  const getMoreMenu = (postId: number) => ({
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

  const handleShare = (type: string) => {
    // TODO: 실제 공유 기능 구현
    message.success(`${type}로 공유되었습니다.`);
    setIsShareModalVisible(false);
  };

  const handleSharePost = (postId: number) => {
    setSelectedPostId(postId);
    setIsShareModalVisible(true);
  };

  const handleReportPost = (postId: number) => {
    setSelectedPostId(postId);
    setIsReportModalVisible(true);
  };

  const handleReport = (values: any) => {
    // TODO: 실제 신고 기능 구현
    message.success("신고가 접수되었습니다.");
    setIsReportModalVisible(false);
  };

  // Post 컴포넌트에서 사용할 수 있도록 데이터 변환
  const transformPostForComponent = (post: Post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    images: post.images?.map((img) => ({
      url: img.url,
      isPublic: img.isPublic || false,
    })),
    isMembershipOnly: post.isMembershipOnly,
    isGotMembership: post.isGotMembership,
    textLength: post.textLength,
    imageCount: post.imageCount,
    videoCount: post.videoCount,
    creator: {
      name: post.creator.name,
      handle: post.creator.handle,
      avatar: post.creator.avatar,
    },
  });

  // 필터링된 피드
  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    if (filter === "membership") return post.isMembershipOnly;
    if (filter === "public") return !post.isMembershipOnly;
    return true;
  });

  // id 중복 제거
  const uniqueFilteredPosts = Array.from(
    new Map(filteredPosts.map((post) => [post.id, post])).values()
  );

  // 멤버십 카드 마우스 이동 핸들러
  const handleMembershipMouseMove = (
    postId: number,
    e: MouseEvent<HTMLDivElement>
  ) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    // progress: 카드 상단(0)~하단(1)
    let progress = mouseY / rect.height;
    progress = Math.max(0, Math.min(1, progress));
    // 최대 절반까지만 벗겨짐
    progress = Math.min(progress, 0.5);
    setCoverProgress((prev) => ({ ...prev, [postId]: progress }));
  };
  const handleMembershipMouseLeave = (postId: number) => {
    setCoverProgress((prev) => ({ ...prev, [postId]: 0 }));
  };

  // 쿼리 파라미터(filter) 변경 시 filter 상태 동기화 (새로고침/뒤로가기 등 대응)
  useEffect(() => {
    const filterParam = searchParams.get("feedFilter") as
      | "all"
      | "membership"
      | "public";
    if (filterParam && filterParam !== filter) {
      setFilter(filterParam);
    }
    if (!filterParam && filter !== "all") {
      setFilter("all");
    }
  }, [searchParams]);

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
            dataLength={uniqueFilteredPosts.length}
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
            {uniqueFilteredPosts.map((post) => (
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
                  value={`https://www.crefans.com/post/${selectedPostId}`}
                  readOnly
                  suffix={
                    <Button
                      type="text"
                      icon={<LinkOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://www.crefans.com/post/${selectedPostId}`
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
