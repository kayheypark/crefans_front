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
  SettingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import Spacings from "@/lib/constants/spacings";
import { Layout } from "antd";

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
  allowComments?: boolean;
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
  duration?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
  const [relativeDatePosts, setRelativeDatePosts] = useState<{
    [key: number]: boolean;
  }>({});
  const [openReplies, setOpenReplies] = useState<{[key: number]: boolean}>({});
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // Feed에서 사용하는 목업 데이터 fetch
  const fetchFeedData = async () => {
    const res = await fetch("/mock/feed.json");
    const apiResponse = await res.json();
    const data: Post[] = apiResponse.data;
    return data;
  };

  // 미디어 데이터 fetch
  const fetchMediaData = async () => {
    const res = await fetch("/mock/media.json");
    const apiResponse = await res.json();
    const data: MediaItem[] = apiResponse.data;
    return data;
  };

  useEffect(() => {
    const loadData = async () => {
      const feedData = await fetchFeedData();
      const mediaData = await fetchMediaData();
      setPosts(feedData);
      setMedia(mediaData);
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

  // 답글 토글
  const toggleReplies = (postId: number) => {
    setOpenReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // 댓글 입력 클릭
  const handleCommentInputClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  // 댓글 제출
  const handleCommentSubmit = (postId: number) => {
    console.log('Comment submitted for post:', postId);
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
    allowComments: post.allowComments ?? true, // 기본값 true
    textLength: post.textLength,
    imageCount: post.imageCount,
    videoCount: post.videoCount,
    creator: {
      name: post.creator.name,
      handle: post.creator.handle,
      avatar: post.creator.avatar,
    },
  });


  const handleSharePost = (postId: number) => {
    setSelectedPostId(postId);
    setIsShareModalVisible(true);
  };

  const handleReportPost = (postId: number) => {
    setSelectedPostId(postId);
    setIsReportModalVisible(true);
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
      <div style={{ padding: "20px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2px",
            width: "100%",
          }}
        >
          {media.map((item) => (
            <div
              key={item.id}
              style={{
                position: "relative",
                aspectRatio: "1",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              {item.type === "video" ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "rgba(0, 0, 0, 0.7)",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PlayCircleOutlined
                      style={{ fontSize: 16, color: "#fff" }}
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      background: "rgba(0, 0, 0, 0.8)",
                      color: "#fff",
                      padding: "1px 4px",
                      borderRadius: 2,
                      fontSize: 10,
                      fontWeight: 500,
                    }}
                  >
                    {item.duration || "0:00"}
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFollowing = () => {
    return (
      <div style={{ padding: "20px 0" }}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Empty
            description="팔로잉한 회원이 없습니다"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    );
  };

  const renderFollowers = () => {
    return (
      <div style={{ padding: "20px 0" }}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Empty
            description="팔로워가 없습니다"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    );
  };

  return (
    <Layout
      style={{
        width: "100%",
        margin: "0",
        paddingLeft: Spacings.CONTENT_LAYOUT_PADDING,
        paddingRight: Spacings.CONTENT_LAYOUT_PADDING,
        background: "transparent",
      }}
    >
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
          padding: "0 16px",
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
                <Button
                  type="primary"
                  ghost
                  icon={<HeartOutlined />}
                  style={{
                    color: "#ff4d4f",
                    borderColor: "#ff4d4f",
                  }}
                >
                  팔로우
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

            {/* 회원 타입 표시 */}
            <div style={{ marginBottom: 8 }}>
              <Tag
                color="gold"
                icon={<CrownOutlined />}
                style={{ fontSize: 12 }}
              >
                크리에이터
              </Tag>
            </div>

            <Text
              style={{
                fontSize: 14,
                color: "#666",
                lineHeight: 1.4,
                marginBottom: 16,
              }}
            >
              내 프로필과 콘텐츠들을 확인할 수 있습니다. 다양한 활동과 관심사를
              공유하고 있습니다.
            </Text>

            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <Button
                type="text"
                //outline
                style={{
                  border: "1px solid #666",
                  borderRadius: 4,
                  padding: "4px 8px",
                  fontSize: 14,
                }}
                icon={<SettingOutlined />}
                onClick={() => router.push("/profile/edit")}
              >
                프로필 관리
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 구분선과 글쓰기 버튼 */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            height: "1px",
            backgroundColor: "#f0f0f0",
            marginBottom: 16,
          }}
        />

        <div style={{ padding: "0 16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/write")}
            style={{
              width: "100%",
              height: "40px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            글쓰기
          </Button>
        </div>

        <div
          style={{
            height: "1px",
            backgroundColor: "#f0f0f0",
            marginTop: 16,
          }}
        />
      </div>

      {/* 탭 영역 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{ paddingLeft: "16px" }}
        items={[
          {
            key: "posts",
            label: "게시물 391",
            children: renderPosts(),
          },
          {
            key: "media",
            label: "미디어 1,241",
            children: renderMedia(),
          },
          {
            key: "following",
            label: "팔로잉 1",
            children: renderFollowing(),
          },
          {
            key: "followers",
            label: "팔로워 2,567",
            children: renderFollowers(),
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
    </Layout>
  );
}
