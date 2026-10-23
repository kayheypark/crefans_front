"use client";
import type { Feedback } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";
import { postingApi } from "@/lib/api/posting";
import { IPost } from "@/types/post";
import { useRouter, useSearchParams } from "next/navigation";
import { MouseEvent, useEffect, useState } from "react";
import { useFeedData } from "./useFeedData";

export function useFeedModel({ message }: { message: Feedback }) {
  const { user } = useAuth();

  const router = useRouter();

  const searchParams = useSearchParams();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);

  const [relativeDatePosts, setRelativeDatePosts] = useState<{
    [key: string]: boolean;
  }>({});

  const [openReplies, setOpenReplies] = useState<{ [key: string]: boolean }>(
    {},
  );

  const [filter, setFilter] = useState<"all" | "membership" | "public">(
    (searchParams.get("feedFilter") as "all" | "membership" | "public") ||
      "all",
  );

  const [coverProgress, setCoverProgress] = useState<{ [key: string]: number }>(
    {},
  );

  //무단 복제금지 문구
  const noCopyGuideText =
    "crefans에 등록된 모든 포스팅 콘텐츠의 캡쳐 및 배포/재배포는 이용약관과 관련 법령에 의거하여 엄격히 금지되어있고, 민/형사상 처벌의 대상이 됩니다.";

  const {
    posts,
    setPosts,
    likedPosts,
    setLikedPosts,
    hasMore,
    loading,
    loadMoreData,
  } = useFeedData(user?.attributes.sub ?? null, filter);

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

  const handleLike = async (postId: string) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const currentPost = posts.find((p) => p.id === postId);
      if (!currentPost) return;

      const isCurrentlyLiked =
        currentPost.isLiked || likedPosts.includes(postId);

      // 낙관적 업데이트
      if (isCurrentlyLiked) {
        // Unlike
        setLikedPosts((prev) => prev.filter((id) => id !== postId));
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: false,
                  likeCount: Math.max(0, (post.likeCount || 0) - 1),
                }
              : post,
          ),
        );

        await postingApi.unlikePosting(postId);
        message.success("좋아요를 취소했습니다.");
      } else {
        // Like
        setLikedPosts((prev) => [...prev, postId]);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: true,
                  likeCount: (post.likeCount || 0) + 1,
                }
              : post,
          ),
        );

        await postingApi.likePosting(postId);
        message.success("좋아요를 눌렀습니다.");
      }
    } catch (error: any) {
      console.error("Failed to toggle like:", error);
      const errorMessage = error.message || "좋아요 처리에 실패했습니다.";
      message.error(errorMessage);

      // API 실패시 상태 롤백
      const currentPost = posts.find((p) => p.id === postId);
      if (currentPost) {
        const wasLiked = currentPost.isLiked || likedPosts.includes(postId);
        if (wasLiked) {
          setLikedPosts((prev) => [...prev, postId]);
          setPosts((prev) =>
            prev.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    isLiked: true,
                    likeCount: (post.likeCount || 0) + 1,
                  }
                : post,
            ),
          );
        } else {
          setLikedPosts((prev) => prev.filter((id) => id !== postId));
          setPosts((prev) =>
            prev.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    isLiked: false,
                    likeCount: Math.max(0, (post.likeCount || 0) - 1),
                  }
                : post,
            ),
          );
        }
      }
    }
  };

  const togglePostExpand = (postId: string) => {
    setExpandedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  // 날짜 표기 토글
  const toggleDateType = (postId: string) => {
    setRelativeDatePosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

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

  const handleShare = (type: string) => {
    // TODO: 실제 공유 기능 구현
    message.success(`${type}로 공유되었습니다.`);
    setIsShareModalVisible(false);
  };

  const handleSharePost = (postId: string) => {
    setSelectedPostId(postId);
    setIsShareModalVisible(true);
  };

  const handleReportPost = (postId: string) => {
    setSelectedPostId(postId);
    setIsReportModalVisible(true);
  };

  const handleReport = (values: any) => {
    // TODO: 실제 신고 기능 구현
    message.success("신고가 접수되었습니다.");
    setIsReportModalVisible(false);
  };

  // Post 컴포넌트에서 사용할 수 있도록 데이터 변환
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
    // API에서 받은 hasAccess 값을 사용, 기본값은 true
    isGotMembership: post.hasAccess !== false,
    // 실제 API 데이터를 기반으로 멤버십 전용 여부 결정
    isMembershipOnly: post.isMembershipOnly || false,
    // 실제 API 응답 데이터 사용
    content: post.content,
    allowComments: post.allowComments ?? true, // 기본값 true
    createdAt: post.createdAt,
    commentCount: post.commentCount,
    likeCount: post.likeCount || 0,
    isLiked: post.isLiked || false,
  });

  // 백엔드에서 필터링되어 오므로 중복 제거만 수행
  const uniquePosts = Array.from(
    new Map(posts.map((post) => [post.id, post])).values(),
  );

  // 멤버십 카드 마우스 이동 핸들러
  const handleMembershipMouseMove = (
    postId: string,
    e: MouseEvent<HTMLDivElement>,
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

  const handleMembershipMouseLeave = (postId: string) => {
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

  return {
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
  };
}
