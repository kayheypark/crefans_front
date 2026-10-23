"use client";
import type { Feedback } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import {
  MediaItem,
  Membership,
  ProfileProps,
  UserProfile,
} from "@/features/creator-profile/types";
import { followApi } from "@/lib/api/follow";
import { membershipAPI, MembershipItem } from "@/lib/api/membership";
import { userAPI } from "@/lib/api/user";
import { formatRelativeDate } from "@/lib/utils/dateUtils";
import { IPost } from "@/types/post";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function useProfileModel(
  { handle }: ProfileProps,
  { message }: { message: Feedback },
) {
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
    {},
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
      { threshold: 0.1 },
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
        100,
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
        100,
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
        : [...prev, postId],
    );
  };

  const togglePostExpand = (postId: string) => {
    setExpandedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
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
    donationMessage?: string,
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
    const price =
      typeof item.price === "number" ? item.price : parseFloat(item.price) || 0;
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
      const response =
        await membershipAPI.getMembershipsFromProfile(cleanHandle);

      if (response.success && response.data) {
        const memberships = response.data.memberships || [];
        const transformedMemberships = memberships.map(transformMembershipData);
        setMemberships(transformedMemberships);
      } else {
        // Fallback to creator-specific endpoint
        try {
          const creatorResponse = await membershipAPI.getMembershipsByCreatorId(
            profile.userSub,
          );
          if (creatorResponse.success && creatorResponse.data) {
            const memberships = creatorResponse.data.memberships || [];
            const transformedMemberships = memberships.map(
              transformMembershipData,
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

  return {
    user,
    router,
    profile,
    setProfile,
    loading,
    isFollowing,
    setIsFollowing,
    activeTab,
    setActiveTab,
    posts,
    media,
    likedPosts,
    expandedPosts,
    relativeDatePosts,
    openReplies,
    isShareModalVisible,
    setIsShareModalVisible,
    isReportModalVisible,
    setIsReportModalVisible,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isDonationModalOpen,
    setIsDonationModalOpen,
    isMembershipJoinModalOpen,
    setIsMembershipJoinModalOpen,
    selectedMembershipId,
    setSelectedMembershipId,
    memberships,
    membershipLoading,
    membershipError,
    subscribedMembershipIds,
    isMembershipExpanded,
    setIsMembershipExpanded,
    selectedPostId,
    hasMorePosts,
    loadingMore,
    loadMoreRef,
    followingList,
    setFollowingList,
    followersList,
    setFollowersList,
    followingCount,
    followersCount,
    followingLoading,
    followersLoading,
    isOwnProfile,
    handleLike,
    togglePostExpand,
    toggleDateType,
    toggleReplies,
    handleCommentInputClick,
    handleCommentSubmit,
    formatDate,
    transformPostForComponent,
    handleSharePost,
    handleReportPost,
    handleEditPost,
    handleDonationSubmit,
  };
}
