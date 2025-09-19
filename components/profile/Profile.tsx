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
import MembershipJoinModal from "@/components/modals/MembershipJoinModal";
import Post from "@/components/post/Post";
import FollowButton from "@/components/common/FollowButton";
import CategoryTag from "@/components/common/CategoryTag";
import { followApi } from "@/lib/api/follow";
import { membershipAPI, MembershipItem } from "@/lib/api/membership";
import { subscriptionBillingAPI } from "@/lib/api/subscriptionBilling";
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

interface Membership {
  id: string; // Updated to string for billing system
  name: string;
  level: number;
  price: number; // Will be parsed from backend string
  description?: string;
  benefits: string[]; // Will be parsed from backend string
  billing_unit?: string;
  billing_period?: number;
  trial_unit?: string;
  trial_period?: number;
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
  hasSubscription?: boolean; // 내가 이 크리에이터를 구독했는지 여부
  subscribedMembershipIds?: string[]; // 내가 구독 중인 멤버십 ID 목록
}

interface ProfileProps {
  handle: string;
}

export default function Profile({ handle }: ProfileProps) {
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
  const [isMembershipJoinModalOpen, setIsMembershipJoinModalOpen] =
    useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState<
    string | undefined
  >(undefined);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState<string | null>(null);
  const [subscribedMembershipIds, setSubscribedMembershipIds] = useState<
    string[]
  >([]);
  const [isMembershipExpanded, setIsMembershipExpanded] = useState(false);
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
    loadMemberships(); // 리얼 멤버십 데이터 로드
  }, [handle]);

  useEffect(() => {
    if (profile) {
      fetchUserPosts(true); // 초기 로드 시 reset = true
      fetchUserMedia();
      loadMemberships(); // Load memberships after profile is loaded
      // 프로필 API에서 이미 구독 상태를 받아오므로 subscribedMembershipIds 설정
      setSubscribedMembershipIds(profile.subscribedMembershipIds || []);
    }
  }, [profile, isOwnProfile, user]);

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

  const handleEditPost = (postId: string) => {
    router.push(`/write?id=${postId}`);
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

  // Transform membership item data
  const transformMembershipData = (item: MembershipItem): Membership => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    let benefits: string[] = [];

    try {
      if (item.benefits) {
        if (item.benefits.startsWith("[")) {
          benefits = JSON.parse(item.benefits);
        } else {
          benefits = item.benefits
            .split(",")
            .map((b) => b.trim())
            .filter((b) => b.length > 0);
        }
      }
    } catch (e) {
      benefits = item.benefits
        ? item.benefits
            .split(",")
            .map((b) => b.trim())
            .filter((b) => b.length > 0)
        : [];
    }

    return {
      id: item.id,
      name: item.name,
      level: item.level,
      price: price,
      description: item.description || undefined,
      benefits: benefits,
      billing_unit: item.billing_unit,
      billing_period: item.billing_period,
      trial_unit: item.trial_unit,
      trial_period: item.trial_period,
    };
  };

  // 리얼 멤버십 데이터 로드
  const loadMemberships = async () => {
    if (!profile?.userSub) {
      return;
    }

    setMembershipLoading(true);
    setMembershipError(null);

    try {
      // Try to get memberships from user profile first
      const response = await membershipAPI.getMembershipsFromProfile(
        cleanHandle
      );

      if (response.success && response.data) {
        const memberships = response.data.memberships || [];
        const transformedMemberships = memberships.map(
          transformMembershipData
        );
        setMemberships(transformedMemberships);
      } else {
        // Fallback to creator-specific endpoint
        try {
          const creatorResponse = await membershipAPI.getMembershipsByCreatorId(
            profile.userSub
          );
          if (creatorResponse.success && creatorResponse.data) {
            const memberships = creatorResponse.data.memberships || [];
            const transformedMemberships = memberships.map(
              transformMembershipData
            );
            setMemberships(transformedMemberships);
          } else {
            setMemberships([]);
          }
        } catch (creatorError) {
          console.error("Failed to fetch creator memberships:", creatorError);
          setMemberships([]);
        }
      }
    } catch (error) {
      console.error("Failed to load membership data:", error);
      setMembershipError("멤버십 정보를 불러오는데 실패했습니다.");
      setMemberships([]);
    } finally {
      setMembershipLoading(false);
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
            onEdit={handleEditPost}
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
                {/* 본인 프로필이 아닌 경우에만 팔로우 버튼 표시 */}
                {!isOwnProfile && profile.userSub && (
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

      {/* 구분선과 후원하기 버튼 (다른 사용자 + 크리에이터일 때만) */}
      {!isOwnProfile && profile.isCreator && (
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
              icon={<GiftOutlined />}
              onClick={() => {
                if (!user) {
                  setIsLoginModalOpen(true);
                  return;
                }
                setIsDonationModalOpen(true);
              }}
              style={{
                width: "100%",
                height: "40px",
                fontSize: "16px",
                fontWeight: "500",
                background: "linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)",
                border: "none",
                boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)",
              }}
            >
              후원하기
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

      {/* 멤버십 섹션 (다른 사용자 + 크리에이터일 때만) */}
      {!isOwnProfile && profile.isCreator && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ padding: "0 16px" }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, fontSize: 18 }}>
                멤버십 가입
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                특별한 혜택을 받을 수 있는 멤버십에 가입해보세요
              </Text>
            </div>

            {membershipLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="small" />
                <div style={{ marginTop: 8, fontSize: 14, color: "#999" }}>
                  멤버십 정보를 불러오는 중...
                </div>
              </div>
            ) : membershipError ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  backgroundColor: "#fff2f0",
                  borderRadius: "8px",
                  border: "1px solid #ffccc7",
                }}
              >
                <Text type="danger" style={{ fontSize: 14 }}>
                  {membershipError}
                </Text>
              </div>
            ) : memberships.length > 0 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {/* 첫 번째 멤버십 (항상 표시) */}
                {memberships[0] && (
                  <div
                    style={{
                      border: "1px solid #d9d9d9",
                      borderRadius: "12px",
                      padding: "16px",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#1890ff";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(24, 144, 255, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#d9d9d9";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <Text strong style={{ fontSize: 16 }}>
                            {memberships[0].name}
                          </Text>
                          <Tag color="blue" style={{ margin: 0, fontSize: 12 }}>
                            레벨 {memberships[0].level}
                          </Tag>
                        </div>
                        {memberships[0].description && (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 13,
                              display: "block",
                              marginBottom: 8,
                            }}
                          >
                            {memberships[0].description}
                          </Text>
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                          }}
                        >
                          {memberships[0].benefits
                            .slice(0, 3)
                            .map((benefit: string, index: number) => (
                              <Tag
                                key={index}
                                color="green"
                                style={{ fontSize: 11 }}
                              >
                                {benefit}
                              </Tag>
                            ))}
                          {memberships[0].benefits.length > 3 && (
                            <Tag color="default" style={{ fontSize: 11 }}>
                              +{memberships[0].benefits.length - 3}개 더
                            </Tag>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 8,
                        }}
                      >
                        <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                          {memberships[0].price.toLocaleString()}원
                        </Text>
                        {memberships[0].billing_unit &&
                          memberships[0].billing_period && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#999",
                                textAlign: "right",
                              }}
                            >
                              / {memberships[0].billing_period}
                              {memberships[0].billing_unit === "MONTH"
                                ? "개월"
                                : "년"}
                            </div>
                          )}
                        {subscribedMembershipIds.includes(memberships[0].id) ? (
                          <div
                            style={{
                              borderRadius: "6px",
                              fontSize: 12,
                              height: "28px",
                              padding: "0 12px",
                              backgroundColor: "#52c41a",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <CheckCircleOutlined />
                            구독중
                          </div>
                        ) : (
                          <Button
                            type="primary"
                            size="small"
                            style={{
                              borderRadius: "6px",
                              fontSize: 12,
                              height: "28px",
                              padding: "0 12px",
                            }}
                            onClick={() => {
                              if (!user) {
                                setIsLoginModalOpen(true);
                                return;
                              }
                              setSelectedMembershipId(memberships[0].id);
                              setIsMembershipJoinModalOpen(true);
                            }}
                          >
                            가입하기
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 나머지 멤버십들 (펼쳐진 상태일 때만) */}
                {isMembershipExpanded &&
                  memberships.slice(1).map((membership) => (
                    <div
                      key={membership.id}
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: "12px",
                        padding: "16px",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#1890ff";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(24, 144, 255, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <Text strong style={{ fontSize: 16 }}>
                              {membership.name}
                            </Text>
                            <Tag
                              color="blue"
                              style={{ margin: 0, fontSize: 12 }}
                            >
                              레벨 {membership.level}
                            </Tag>
                          </div>
                          {membership.description && (
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 13,
                                display: "block",
                                marginBottom: 8,
                              }}
                            >
                              {membership.description}
                            </Text>
                          )}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                            }}
                          >
                            {membership.benefits.map(
                              (benefit: string, index: number) => (
                                <Tag
                                  key={index}
                                  color="green"
                                  style={{ fontSize: 11 }}
                                >
                                  {benefit}
                                </Tag>
                              )
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 8,
                          }}
                        >
                          <Text
                            strong
                            style={{ fontSize: 18, color: "#1890ff" }}
                          >
                            {membership.price.toLocaleString()}원
                          </Text>
                          {membership.billing_unit &&
                            membership.billing_period && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#999",
                                  textAlign: "right",
                                }}
                              >
                                / {membership.billing_period}
                                {membership.billing_unit === "MONTH"
                                  ? "개월"
                                  : "년"}
                              </div>
                            )}
                          {subscribedMembershipIds.includes(membership.id) ? (
                            <div
                              style={{
                                borderRadius: "6px",
                                fontSize: 12,
                                height: "28px",
                                padding: "0 12px",
                                backgroundColor: "#52c41a",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <CheckCircleOutlined />
                              구독중
                            </div>
                          ) : (
                            <Button
                              type="primary"
                              size="small"
                              style={{
                                borderRadius: "6px",
                                fontSize: 12,
                                height: "28px",
                                padding: "0 12px",
                              }}
                              onClick={() => {
                                if (!user) {
                                  setIsLoginModalOpen(true);
                                  return;
                                }
                                setSelectedMembershipId(membership.id);
                                setIsMembershipJoinModalOpen(true);
                              }}
                            >
                              가입하기
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                {/* 펼치기/접기 버튼 (멤버십이 2개 이상일 때만) - 맨 하단에 위치 */}
                {memberships.length > 1 && (
                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <Button
                      type="text"
                      onClick={() =>
                        setIsMembershipExpanded(!isMembershipExpanded)
                      }
                      style={{
                        fontSize: 14,
                        color: "#1890ff",
                        padding: "8px 16px",
                      }}
                    >
                      {isMembershipExpanded ? (
                        <>
                          <span>접기</span>
                          <span style={{ marginLeft: 4 }}>▲</span>
                        </>
                      ) : (
                        <>
                          <span>더보기 ({memberships.length - 1}개)</span>
                          <span style={{ marginLeft: 4 }}>▼</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Text type="secondary" style={{ fontSize: 16 }}>
                  현재 구독 가능한 멤버십이 없습니다
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 14 }}>
                  댓글로 멤버십을 만들어 달라고 해보세요
                </Text>
              </div>
            )}
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

      {/* 멤버십 가입 모달 */}
      {profile && (
        <MembershipJoinModal
          open={isMembershipJoinModalOpen}
          onClose={() => setIsMembershipJoinModalOpen(false)}
          creatorName={profile.name}
          creatorHandle={profile.handle}
          creatorAvatar={profile.avatar}
          memberships={memberships.map((m) => ({
            ...m,
            billing_unit: (m.billing_unit || "MONTH") as
              | "DAY"
              | "WEEK"
              | "MONTH"
              | "YEAR",
            billing_period: m.billing_period || 1,
          }))}
          defaultSelectedMembershipId={selectedMembershipId}
          subscribedMembershipIds={subscribedMembershipIds}
        />
      )}
    </Layout>
  );
}
