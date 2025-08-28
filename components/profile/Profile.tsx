"use client";

import React, { useState, useEffect } from "react";
import Avatar from "antd/lib/avatar";
import Button from "antd/lib/button";
import Space from "antd/lib/space";
import Typography from "antd/lib/typography";
import Tabs from "antd/lib/tabs";
import Card from "antd/lib/card";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Tag from "antd/lib/tag";
import Empty from "antd/lib/empty";
import Modal from "antd/lib/modal";
import Input from "antd/lib/input";
import message from "antd/lib/message";
import ReportModal from "@/components/modals/ReportModal";
import LoginModal from "@/components/modals/LoginModal";
import Post from "@/components/post/Post";
import {
  ClockCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  UserOutlined,
  EditOutlined,
  ShareAltOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  PictureOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";

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

interface MediaItem {
  id: number;
  title: string;
  type: "video" | "image";
  url: string;
  thumbnail: string;
  createdAt: string;
  views: number;
  likes: number;
}

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
  const [relativeDatePosts, setRelativeDatePosts] = useState<{
    [key: number]: boolean;
  }>({});
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [openReplies, setOpenReplies] = useState<{ [key: number]: boolean }>(
    {}
  );

  // Feed에서 사용하는 목업 데이터 fetch
  const fetchFeedData = async () => {
    const res = await fetch("/mock/feed.json");
    const data: Post[] = await res.json();
    return data;
  };

  // 미디어 데이터 (임시)
  const fetchMediaData = (): MediaItem[] => {
    return [
      {
        id: 1,
        title: "첫 번째 동영상",
        type: "video",
        url: "/video_1.mp4",
        thumbnail: "/image_1_160x120.png",
        createdAt: "2024-01-15",
        views: 1234,
        likes: 56,
      },
      {
        id: 2,
        title: "첫 번째 이미지",
        type: "image",
        url: "/image_2_240x160.png",
        thumbnail: "/image_2_240x160.png",
        createdAt: "2024-01-10",
        views: 890,
        likes: 34,
      },
      {
        id: 3,
        title: "두 번째 동영상",
        type: "video",
        url: "/video_1.mp4",
        thumbnail: "/image_3_320x240.png",
        createdAt: "2024-01-05",
        views: 567,
        likes: 23,
      },
      {
        id: 4,
        title: "두 번째 이미지",
        type: "image",
        url: "/image_4_400x240.png",
        thumbnail: "/image_4_400x240.png",
        createdAt: "2024-01-03",
        views: 456,
        likes: 12,
      },
    ];
  };

  useEffect(() => {
    const loadData = async () => {
      const feedData = await fetchFeedData();
      setPosts(feedData);
      setMedia(fetchMediaData());
    };
    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}일 전`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
    return `${Math.floor(diffInSeconds / 31536000)}년 전`;
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const handleLike = (postId: number) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const togglePostExpand = (postId: number) => {
    setExpandedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleDateType = (postId: number) => {
    setRelativeDatePosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleReport = (values: any) => {
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

  const handleCommentInputClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  const handleCommentSubmit = (postId: number) => {
    message.success("답글이 작성되었습니다.");
  };

  const handleSharePost = (postId: number) => {
    setSelectedPostId(postId);
    setIsShareModalVisible(true);
  };

  const handleReportPost = (postId: number) => {
    setSelectedPostId(postId);
    setIsReportModalVisible(true);
  };

  const toggleReplies = (postId: number) => {
    setOpenReplies((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const renderPosts = () => {
    if (posts.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Empty
            description="아직 게시물이 없습니다"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <div style={{ padding: "20px 0" }}>
        {posts.map((post) => (
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
      </div>
    );
  };

  const renderMedia = () => {
    if (media.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Empty
            description="아직 미디어가 없습니다"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <Row gutter={[16, 16]} style={{ padding: "20px 0" }}>
        {media.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              cover={
                <div style={{ position: "relative" }}>
                  <img
                    alt={item.title}
                    src={item.thumbnail}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                    }}
                  />
                  {item.type === "video" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(0, 0, 0, 0.7)",
                        borderRadius: "50%",
                        width: 48,
                        height: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PlayCircleOutlined
                        style={{ fontSize: 24, color: "#fff" }}
                      />
                    </div>
                  )}
                  <Tag
                    color={item.type === "video" ? "blue" : "green"}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      margin: 0,
                    }}
                  >
                    {item.type === "video" ? "동영상" : "이미지"}
                  </Tag>
                </div>
              }
              bodyStyle={{ padding: "12px" }}
            >
              <div>
                <Title level={5} style={{ marginBottom: 8, fontSize: 14 }}>
                  {item.title}
                </Title>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <ClockCircleOutlined
                      style={{ fontSize: 12, color: "#999" }}
                    />
                    <Text style={{ fontSize: 11, color: "#999" }}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <EyeOutlined style={{ fontSize: 12, color: "#999" }} />
                    <Text style={{ fontSize: 11, color: "#999" }}>
                      {item.views}
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <HeartOutlined style={{ fontSize: 12, color: "#999" }} />
                    <Text style={{ fontSize: 11, color: "#999" }}>
                      {item.likes}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div style={{ width: 800, margin: "0", paddingLeft: 32, paddingRight: 32 }}>
      {/* 커버 이미지 */}
      <div
        style={{
          width: "100%",
          height: 200,
          background: "#f0f0f0",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: 14,
          marginBottom: 16,
        }}
      >
        커버 이미지
      </div>

      {/* 프로필 정보 - MainLayout 스타일 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 24,
          position: "relative",
        }}
      >
        <Avatar
          size={80}
          src={user?.attributes?.picture || "/profile-90.png"}
          icon={<UserOutlined />}
        />
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text
                strong
                style={{
                  fontSize: 20,
                  color: "#222",
                }}
              >
                {user?.attributes?.nickname || "-"}
              </Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Button type="text" icon={<EditOutlined />}>
                  프로필 편집
                </Button>
                <Button type="text" icon={<ShareAltOutlined />}>
                  공유
                </Button>
              </div>
            </div>
            <Text
              type="secondary"
              style={{
                fontSize: 16,
                color: "#8c8c8c",
                marginBottom: 4,
                display: "block",
              }}
            >
              {user?.attributes?.preferred_username
                ? "@" + user.attributes.preferred_username
                : "@-"}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                lineHeight: 1.4,
              }}
            >
              내 프로필과 콘텐츠들을 확인할 수 있습니다. 다양한 활동과 관심사를
              공유하고 있습니다.
            </Text>
          </div>
        </div>
      </div>

      {/* 탭 영역 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "posts",
            label: "게시물",
            children: renderPosts(),
          },
          {
            key: "media",
            label: "미디어",
            children: renderMedia(),
          },
        ]}
        style={{ marginBottom: 24 }}
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
                value={`https://www.crefans.com/post/${selectedPostId}`}
                readOnly
                suffix={
                  <Button
                    type="text"
                    icon={<ShareAltOutlined />}
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
              style={{ display: "flex", justifyContent: "center", gap: "24px" }}
            >
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={() => {
                  message.success("Facebook으로 공유되었습니다.");
                  setIsShareModalVisible(false);
                }}
              />
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={() => {
                  message.success("Twitter로 공유되었습니다.");
                  setIsShareModalVisible(false);
                }}
              />
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={() => {
                  message.success("Instagram으로 공유되었습니다.");
                  setIsShareModalVisible(false);
                }}
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
    </div>
  );
}
