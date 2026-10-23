"use client";
import type { Feedback } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";
import { postingApi } from "@/lib/api/posting";
import { IPost } from "@/types/post";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function usePostPageModel({ message }: { message: Feedback }) {
  const params = useParams();

  const router = useRouter();

  const { user } = useAuth();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [post, setPost] = useState<IPost | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Modal state management
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Post 컴포넌트에서 사용할 상태들
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);

  const [relativeDatePosts, setRelativeDatePosts] = useState<{
    [key: string]: boolean;
  }>({});

  const [openReplies, setOpenReplies] = useState<{ [key: string]: boolean }>(
    {},
  );

  const postId = params.id as string;

  // PostingResponse를 IPost로 변환하는 함수
  const transformPostingResponse = (postingData: any): IPost => {
    return {
      id: postingData.id,
      creator: {
        id: postingData.user.id,
        handle: postingData.user.handle,
        name: postingData.user.name,
        avatar: postingData.user.avatar || "/profile-90.png",
      },
      title: postingData.title,
      content: postingData.content,
      isMembershipOnly: postingData.isMembership || false,
      // API에서 받은 실제 멤버십 상태 사용 (백엔드에서 구독 상태 기반으로 계산됨)
      isGotMembership:
        postingData.isGotMembership !== undefined
          ? postingData.isGotMembership
          : true,
      allowComments: true, // 기본값
      createdAt: postingData.createdAt,
      media: postingData.medias || [],
      textLength: postingData.content?.length || 0,
      imageCount:
        postingData.medias?.filter((m: any) => m.type === "IMAGE").length || 0,
      videoCount:
        postingData.medias?.filter((m: any) => m.type === "VIDEO").length || 0,
      commentCount: postingData.commentCount || 0,
      likeCount: postingData.likeCount || 0,
      isLiked: postingData.isLiked || false,
      // API에서 받은 실제 접근 권한 사용
      hasAccess:
        postingData.hasAccess !== undefined ? postingData.hasAccess : true,
      membershipLevel: postingData.membershipLevel,
      allowIndividualPurchase: postingData.allowIndividualPurchase || false,
      individualPurchasePrice: postingData.individualPurchasePrice,
    };
  };

  // 포스팅 데이터 조회
  const fetchPost = async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await postingApi.getPosting(postId);

      if (response.success && response.data) {
        const transformedPost = transformPostingResponse(response.data);
        setPost(transformedPost);

        // 좋아요 상태 초기화
        if (response.data.isLiked) {
          setLikedPosts([postId]);
        }
      } else {
        setError("포스팅을 찾을 수 없습니다.");
      }
    } catch (error: any) {
      console.error("포스팅 조회 실패:", error);
      setError(error.message || "포스팅을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // Post 컴포넌트에서 사용할 핸들러들
  const handleLike = async (postId: string) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const currentPost = post;
      if (!currentPost) return;

      const isCurrentlyLiked =
        currentPost.isLiked || likedPosts.includes(postId);

      // 낙관적 업데이트
      if (isCurrentlyLiked) {
        // Unlike
        setLikedPosts((prev) => prev.filter((id) => id !== postId));
        setPost((prev) =>
          prev
            ? {
                ...prev,
                isLiked: false,
                likeCount: Math.max(0, (prev.likeCount || 0) - 1),
              }
            : null,
        );

        await postingApi.unlikePosting(postId);
        message.success("좋아요를 취소했습니다.");
      } else {
        // Like
        setLikedPosts((prev) => [...prev, postId]);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                isLiked: true,
                likeCount: (prev.likeCount || 0) + 1,
              }
            : null,
        );

        await postingApi.likePosting(postId);
        message.success("좋아요를 눌렀습니다.");
      }
    } catch (error: any) {
      console.error("Failed to toggle like:", error);
      const errorMessage = error.message || "좋아요 처리에 실패했습니다.";
      message.error(errorMessage);

      // API 실패시 상태 롤백
      const currentPost = post;
      if (currentPost) {
        const wasLiked = currentPost.isLiked || likedPosts.includes(postId);
        if (wasLiked) {
          setLikedPosts((prev) => [...prev, postId]);
          setPost((prev) =>
            prev
              ? {
                  ...prev,
                  isLiked: true,
                  likeCount: (prev.likeCount || 0) + 1,
                }
              : null,
          );
        } else {
          setLikedPosts((prev) => prev.filter((id) => id !== postId));
          setPost((prev) =>
            prev
              ? {
                  ...prev,
                  isLiked: false,
                  likeCount: Math.max(0, (prev.likeCount || 0) - 1),
                }
              : null,
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

  const toggleDateType = (postId: string) => {
    setRelativeDatePosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleReplies = (postId: string) => {
    setOpenReplies((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentInputClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  const handleCommentSubmit = (postId: string) => {
    console.log("Comment submitted for post:", postId);
  };

  const handleSharePost = (postId: string) => {
    setSelectedPostId(postId);
    setIsShareModalVisible(true);
  };

  const handleReportPost = (postId: string) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedPostId(postId);
    setIsReportModalVisible(true);
  };

  const handleShare = (type: string) => {
    message.success(`${type}로 공유되었습니다.`);
    setIsShareModalVisible(false);
  };

  const handleReport = (values: any) => {
    message.success("신고가 접수되었습니다.");
    setIsReportModalVisible(false);
  };

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
    // API에서 받은 실제 멤버십 상태 사용
    isGotMembership: post.isGotMembership,
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

  return {
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
  };
}
