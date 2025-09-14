"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
import Spin from "antd/lib/spin";
import ReportModal from "@/components/modals/ReportModal";
import LoginModal from "@/components/modals/LoginModal";
import DonationModal from "@/components/modals/DonationModal";
import Post from "@/components/post/Post";
import FollowButton from "@/components/common/FollowButton";
import CategoryTag from "@/components/common/CategoryTag";
import { followApi } from "@/lib/api/follow";
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
  UserAddOutlined,
  UserDeleteOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { userAPI } from "@/lib/api/user";
import Spacings from "@/lib/constants/spacings";
import { Layout } from "antd";
import { formatRelativeDate, formatFullDate } from "@/lib/utils/dateUtils";
import { IPost } from "@/types/post";
import { CreatorCategory } from "@/types/creator";
import { getPostUrl } from "@/utils/env";

const { Title, Paragraph, Text } = Typography;
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

interface UserProfile {
  id: number;
  handle: string;
  name: string;
  avatar: string;
  bio: string;
  isCreator: boolean;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  mediaCount: number;
  userSub?: string; // 팔로우 API 호출을 위한 userSub 추가
  isFollowing?: boolean; // 팔로우 상태 추가
  category?: CreatorCategory | null; // 크리에이터 카테고리 정보 추가
}

interface ProfileByHandleProps {
  handle: string;
}

export default function ProfileByHandle({ handle }: ProfileByHandleProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<IPost[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
  const [relativeDatePosts, setRelativeDatePosts] = useState<{
    [key: string]: boolean;
  }>({});
  const [openReplies, setOpenReplies] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 팔로잉/팔로워 관련 상태
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followersLoading, setFollowersLoading] = useState(false);

  // 현재 사용자가 프로필 소유자인지 확인 (@ 기호 제거하고 비교)
  const cleanHandle = handle.replace(/^@/, "");
  const isOwnProfile = user?.attributes?.preferred_username === cleanHandle;

  useEffect(() => {
    // handle 변경 시 posts 상태 초기화
    setPosts([]);
    setNextCursor(null);
    setHasMorePosts(false);
    setLoadingMore(false);

    fetchUserProfile();
  }, [handle]);

  useEffect(() => {
    if (profile) {
      fetchUserPosts(true); // 초기 로드 시 reset = true
      fetchUserMedia();
    }
  }, [profile, isOwnProfile]);

  // 탭 변경 시 posts 탭으로 돌아올 때 데이터 재로드
  useEffect(() => {
    if (activeTab === "posts" && profile && posts.length === 0) {
      fetchUserPosts(true);
    }
  }, [activeTab, profile]);

  // 팔로잉/팔로워 탭 변경시 데이터 로드
  useEffect(() => {
    if (!profile?.userSub) return;

    if (activeTab === "following" && followingList.length === 0) {
      fetchFollowing();
    } else if (activeTab === "followers" && followersList.length === 0) {
      fetchFollowers();
    }
  }, [activeTab, profile]);

  // 로그인 상태 변경 시 팔로우 데이터 재로드
  useEffect(() => {
    if (!profile?.userSub) return;

    // 로그인 후 프로필 정보와 팔로우 데이터를 새로고침
    if (user) {
      // 메인 프로필의 팔로우 상태 업데이트
      fetchUserProfile();

      // 현재 활성 탭의 데이터를 새로고침
      if (activeTab === "following") {
        fetchFollowing();
      } else if (activeTab === "followers") {
        fetchFollowers();
      }
    }
  }, [user, profile?.userSub]);

  // 무한스크롤을 위한 Intersection Observer 설정
  useEffect(() => {
    if (!loadMoreRef.current || activeTab !== "posts") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePosts && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMorePosts, loadingMore, activeTab]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUserProfileByHandle(cleanHandle);

      if (response.success) {
        setProfile(response.data);
        // 프로필 응답에서 팔로우 상태 설정
        if (response.data.isFollowing !== undefined) {
          setIsFollowing(response.data.isFollowing);
        }
      } else {
        message.error(response.message || "프로필을 찾을 수 없습니다.");
        setProfile(null);
      }
    } catch (error) {
      console.error("프로필 정보를 가져오는데 실패했습니다:", error);
      message.error("프로필을 찾을 수 없습니다.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (reset: boolean = false) => {
    try {
      const cursor = reset ? undefined : nextCursor || undefined;
      const response = await userAPI.getUserPosts(cleanHandle, cursor, 20);

      if (response.success && response.data.posts) {
        if (reset) {
          setPosts(response.data.posts);
        } else {
          setPosts((prev) => [...prev, ...response.data.posts]);
        }
        setNextCursor(response.data.nextCursor);
        setHasMorePosts(response.data.hasMore);
      }
    } catch (error) {
      console.error("포스트를 가져오는데 실패했습니다:", error);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMorePosts) return;

    setLoadingMore(true);
    try {
      await fetchUserPosts(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchUserMedia = async () => {
    try {
      // TODO: 실제 API 호출
      setMedia([]);
    } catch (error) {
      console.error("미디어를 가져오는데 실패했습니다:", error);
    }
  };

  // 팔로잉 목록 가져오기 (특정 사용자의 팔로잉)
  const fetchFollowing = async () => {
    if (!profile?.userSub) return;

    setFollowingLoading(true);
    try {
      const response = await followApi.getUserFollowing(
        profile.userSub,
        1,
        100
      );
      if (response.success && response.data) {
        setFollowingList(response.data.items);
        setFollowingCount(response.data.pagination.totalCount);
      }
    } catch (error) {
      console.error("Failed to fetch following:", error);
      message.error("팔로잉 목록을 가져오는데 실패했습니다.");
    } finally {
      setFollowingLoading(false);
    }
  };

  // 팔로워 목록 가져오기 (특정 사용자의 팔로워)
  const fetchFollowers = async () => {
    if (!profile?.userSub) return;

    setFollowersLoading(true);
    try {
      const response = await followApi.getUserFollowers(
        profile.userSub,
        1,
        100
      );
      if (response.success && response.data) {
        setFollowersList(response.data.items);
        setFollowersCount(response.data.pagination.totalCount);
      }
    } catch (error) {
      console.error("Failed to fetch followers:", error);
      message.error("팔로워 목록을 가져오는데 실패했습니다.");
    } finally {
      setFollowersLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const togglePostExpand = (postId: string) => {
    setExpandedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleDateType = (postId: string) => {
    setRelativeDatePosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // dateUtils의 함수를 사용하도록 변경
  // 답글 토글
  const toggleReplies = (postId: string) => {
    setOpenReplies((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // 댓글 입력 클릭
  const handleCommentInputClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  // 댓글 제출
  const handleCommentSubmit = (postId: string) => {
    console.log("Comment submitted for post:", postId);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 없음";
    return formatRelativeDate(dateString);
  };

  const transformPostForComponent = (post: IPost) => ({
    ...post,
    creator: {
      id: post.creator.id,
      handle: post.creator.handle,
      name: post.creator.name,
      avatar: post.creator.avatar,
    },
    // 기존 images 필드로 변환하여 기존 디자인과 호환
    images:
      post.media
        ?.filter((m) => m.type === "IMAGE")
        .map((m) => ({
          url: m.mediaUrl,
          isPublic: true, // 모든 이미지를 public으로 설정 (권한은 isGotMembership으로 처리)
        })) || [],
    textLength: post.textLength || post.content?.length || 0,
    imageCount:
      post.imageCount ||
      post.media?.filter((m) => m.type === "IMAGE").length ||
      0,
    videoCount:
      post.videoCount ||
      post.media?.filter((m) => m.type === "VIDEO").length ||
      0,
    // API에서 받은 실제 멤버십 상태 사용 (백엔드에서 구독 상태 기반으로 계산됨)
    isGotMembership: post.isGotMembership,
    // 실제 API 데이터를 기반으로 멤버십 전용 여부 결정
    isMembershipOnly: post.isMembershipOnly || false,
    // 실제 API 응답 데이터 사용
    content: post.content,
    allowComments: post.allowComments ?? true, // 기본값 true
    createdAt: post.createdAt, // API 응답의 createdAt
  });

  const handleSharePost = (postId: string) => {
    setSelectedPostId(postId);
    setIsShareModalVisible(true);
  };

  const handleReportPost = (postId: string) => {
    setSelectedPostId(postId);
    setIsReportModalVisible(true);
  };

  const handleDonationSubmit = async (
    amount: number,
    donationMessage?: string
  ) => {
    try {
      // TODO: 실제 후원 API 호출
      console.log("후원 정보:", {
        creatorHandle: handle,
        amount,
        message: donationMessage,
      });

      // 임시 성공 메시지
      message.success(`${amount}콩을 후원했습니다!`);
    } catch (error) {
      message.error("후원 처리 중 오류가 발생했습니다.");
    }
  };

  const renderPosts = () => {
    if (posts.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Empty
            description={
              isOwnProfile
                ? "아직 게시물이 없습니다"
                : `${profile?.name}님의 게시물이 없습니다`
            }
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

        {/* 무한스크롤 로딩 영역 */}
        {hasMorePosts && (
          <div
            ref={loadMoreRef}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              minHeight: "60px",
            }}
          >
            {loadingMore && <Spin size="small" />}
          </div>
        )}
      </div>
    );
  };

  const renderMedia = () => {
    if (media.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Empty
            description={
              isOwnProfile
                ? "아직 미디어가 없습니다"
                : `${profile?.name}님의 미디어가 없습니다`
            }
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
              <img
                src={item.thumbnail}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {item.type === "video" && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0,0,0,0.6)",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    fontSize: "12px",
                    color: "white",
                  }}
                >
                  <PlayCircleOutlined style={{ marginRight: "4px" }} />
                  {item.duration}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFollowing = () => {
    if (followingLoading) {
      return (
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (followingList.length === 0) {
      return (
        <div style={{ padding: "20px 0" }}>
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Empty
              description={
                isOwnProfile
                  ? "팔로잉한 회원이 없습니다"
                  : `${profile?.name}님이 팔로잉하는 회원이 없습니다`
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: "20px 0" }}>
        {followingList.map((followUser) => (
          <Card
            key={followUser.userId}
            style={{
              marginBottom: 12,
              border: "1px solid #f0f0f0",
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 16 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/@${followUser.handle}`)}
              >
                <Avatar
                  size={48}
                  src={followUser.avatar || "/profile-90.png"}
                  icon={<UserOutlined />}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#222",
                    marginBottom: 2,
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/@${followUser.handle}`)}
                >
                  {followUser.nickname}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#8c8c8c",
                    marginBottom: 4,
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/@${followUser.handle}`)}
                >
                  @{followUser.handle}
                </div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  {formatRelativeDate(followUser.followedAt)}에 팔로우
                </div>
              </div>
              <FollowButton
                targetUserId={followUser.userId}
                isFollowing={followUser.isFollowedByRequester || false}
                buttonType="auto"
                size="middle"
                isOwnAccount={
                  user?.attributes?.preferred_username === followUser.handle
                }
                onFollowChange={(newFollowingState) => {
                  // 팔로잉 목록에서 해당 사용자의 팔로우 상태 업데이트
                  setFollowingList((prev) =>
                    prev.map((item) =>
                      item.userId === followUser.userId
                        ? { ...item, isFollowedByRequester: newFollowingState }
                        : item
                    )
                  );

                  // 메인 프로필 버튼 상태도 업데이트 (해당 사용자가 메인 프로필인 경우)
                  if (profile?.userSub === followUser.userId) {
                    setIsFollowing(newFollowingState);
                  }
                }}
                onLoginRequired={() => setIsLoginModalOpen(true)}
              />
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderFollowers = () => {
    if (followersLoading) {
      return (
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (followersList.length === 0) {
      return (
        <div style={{ padding: "20px 0" }}>
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Empty
              description={
                isOwnProfile
                  ? "팔로워가 없습니다"
                  : `${profile?.name}님의 팔로워가 없습니다`
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: "20px 0" }}>
        {followersList.map((follower) => (
          <Card
            key={follower.userId}
            style={{
              marginBottom: 12,
              border: "1px solid #f0f0f0",
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 16 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/@${follower.handle}`)}
              >
                <Avatar
                  size={48}
                  src={follower.avatar || "/profile-90.png"}
                  icon={<UserOutlined />}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#222",
                    marginBottom: 2,
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/@${follower.handle}`)}
                >
                  {follower.nickname}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#8c8c8c",
                    marginBottom: 4,
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/@${follower.handle}`)}
                >
                  @{follower.handle}
                </div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  {formatRelativeDate(follower.followedAt)}에 팔로우함
                </div>
              </div>
              <FollowButton
                targetUserId={follower.userId}
                isFollowing={follower.isFollowedByRequester || false}
                buttonType="auto"
                size="middle"
                isOwnAccount={
                  user?.attributes?.preferred_username === follower.handle
                }
                onFollowChange={(newFollowingState) => {
                  // 팔로워 목록에서 해당 사용자의 팔로우 상태 업데이트
                  setFollowersList((prev) =>
                    prev.map((item) =>
                      item.userId === follower.userId
                        ? { ...item, isFollowedByRequester: newFollowingState }
                        : item
                    )
                  );

                  // 메인 프로필 버튼 상태도 업데이트 (해당 사용자가 메인 프로필인 경우)
                  if (profile?.userSub === follower.userId) {
                    setIsFollowing(newFollowingState);
                  }
                }}
                onLoginRequired={() => setIsLoginModalOpen(true)}
              />
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
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
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
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
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Empty
            description="프로필을 찾을 수 없습니다"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </Layout>
    );
  }

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

      {/* 프로필 정보 - 기존 디자인 유지 */}
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
        <Avatar size={80} src={profile.avatar} icon={<UserOutlined />} />
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
                {profile.name}
              </Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {/* 본인 프로필이 아닌 경우에만 팔로우 버튼과 후원하기 버튼 표시 */}
                {!isOwnProfile && profile.userSub && (
                  <>
                    <FollowButton
                      targetUserId={profile.userSub}
                      isFollowing={isFollowing}
                      buttonType="auto"
                      size="middle"
                      onFollowChange={(newFollowingState) => {
                        setIsFollowing(newFollowingState);
                        // 팔로워 수 업데이트
                        if (profile) {
                          setProfile({
                            ...profile,
                            followersCount:
                              profile.followersCount +
                              (newFollowingState ? 1 : -1),
                          });
                        }

                        // 팔로잉/팔로워 목록에서도 현재 프로필 사용자의 상태 업데이트
                        setFollowingList((prev) =>
                          prev.map((item) =>
                            item.userId === profile.userSub
                              ? {
                                  ...item,
                                  isFollowedByRequester: newFollowingState,
                                }
                              : item
                          )
                        );
                        setFollowersList((prev) =>
                          prev.map((item) =>
                            item.userId === profile.userSub
                              ? {
                                  ...item,
                                  isFollowedByRequester: newFollowingState,
                                }
                              : item
                          )
                        );
                      }}
                      onLoginRequired={() => setIsLoginModalOpen(true)}
                    />

                    {/* 크리에이터인 경우에만 후원하기 버튼 표시 */}
                    {profile.isCreator && (
                      <Button
                        type="primary"
                        icon={<GiftOutlined />}
                        size="middle"
                        style={{
                          background:
                            "linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "600",
                          boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)",
                        }}
                        onClick={() => {
                          if (!user) {
                            setIsLoginModalOpen(true);
                            return;
                          }
                          setIsDonationModalOpen(true);
                        }}
                      >
                        후원하기
                      </Button>
                    )}
                  </>
                )}
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
              @{profile.handle}
            </Text>

            {/* 회원 타입 표시 */}
            {profile.isCreator && (
              <div style={{ marginBottom: 8 }}>
                <Tag
                  color="gold"
                  icon={<CrownOutlined />}
                  style={{ fontSize: 12, marginRight: 8 }}
                >
                  크리에이터
                </Tag>

                {/* 크리에이터 카테고리 태그 표시 */}
                {profile.category && (
                  <CategoryTag
                    category={profile.category}
                    size="default"
                    style={{ marginRight: 8 }}
                  />
                )}

                {profile.isVerified && (
                  <CheckCircleOutlined
                    style={{
                      color: "#1890ff",
                      fontSize: "16px",
                      marginLeft: 4,
                    }}
                  />
                )}
              </div>
            )}

            <Text
              style={{
                fontSize: 14,
                color: "#666",
                lineHeight: 1.4,
                marginBottom: 16,
              }}
            >
              {profile.bio}
            </Text>

            {/* 본인 프로필인 경우에만 프로필 관리 버튼 표시 */}
            {isOwnProfile && (
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <Button
                  type="text"
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
            )}
          </div>
        </div>
      </div>

      {/* 구분선과 글쓰기 버튼 (본인 프로필일 때만) */}
      {isOwnProfile && (
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
      )}

      {/* 탭 영역 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{ paddingLeft: "16px" }}
        items={[
          {
            key: "posts",
            label: `게시물 ${profile.postsCount}`,
            children: renderPosts(),
          },
          {
            key: "media",
            label: `미디어 ${profile.mediaCount.toLocaleString()}`,
            children: renderMedia(),
          },
          {
            key: "following",
            label: `팔로잉 ${
              followingCount > 0 ? followingCount : profile.followingCount
            }`,
            children: renderFollowing(),
          },
          {
            key: "followers",
            label: `팔로워 ${
              followersCount > 0
                ? followersCount.toLocaleString()
                : profile.followersCount.toLocaleString()
            }`,
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
                value={getPostUrl(selectedPostId || "")}
                readOnly
                suffix={
                  <Button
                    type="text"
                    icon={<ShareAltOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        getPostUrl(selectedPostId || "")
                      );
                      message.success("링크가 복사되었습니다.");
                    }}
                  />
                }
              />
            </div>
          </Space>
        </div>
      </Modal>

      {/* 신고 모달 */}
      <ReportModal
        open={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
      />

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* 후원하기 모달 */}
      {profile && (
        <DonationModal
          open={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          creatorName={profile.name}
          creatorHandle={profile.handle}
          creatorAvatar={profile.avatar}
          onSubmit={handleDonationSubmit}
        />
      )}
    </Layout>
  );
}
