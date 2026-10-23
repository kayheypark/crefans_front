"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PostProps } from "@/features/post-card/types";
import { useResponsive } from "@/hooks/useResponsive";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "yet-another-react-lightbox/styles.css";

export function usePostModel({
  post,
  likedPosts,
  expandedPosts,
  relativeDatePosts,
  openReplies,
  onLike,
  onToggleExpand,
  onToggleDateType,
  onToggleReplies,
  onCommentInputClick,
  onCommentSubmit,
  onShare,
  onReport,
  onEdit,
  formatDate,
  formatFullDate,
}: PostProps) {
  const { user } = useAuth();

  const router = useRouter();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [showComments, setShowComments] = useState(false);

  const [commentCount, setCommentCount] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState(0);

  // 미디어를 lightbox 형식으로 변환
  const getLightboxSlides = () => {
    if (!post.media) return [];

    return post.media
      .filter((media) => media.type === "IMAGE" || media.type === "VIDEO")
      .map((media) => {
        if (media.type === "IMAGE") {
          return {
            type: "image" as const,
            src: media.mediaUrl,
            alt: noCopyGuideText,
          };
        } else {
          return {
            type: "video" as const,
            sources: [
              {
                src: media.mediaUrl,
                type: "video/mp4",
              },
            ],
          };
        }
      });
  };

  const handleThumbnailClick = () => {
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  // 디버깅용 useEffect
  useEffect(() => {
    console.log("Post component rendered:", {
      postId: post.id,
      isMembershipOnly: post.isMembershipOnly,
      isGotMembership: post.isGotMembership,
      contentLength: post.content.length,
      expandedPosts: expandedPosts,
    });
  }, [
    post.id,
    post.isMembershipOnly,
    post.isGotMembership,
    post.content.length,
    expandedPosts,
  ]);

  const noCopyGuideText =
    "crefans에 등록된 모든 포스팅 콘텐츠의 캡쳐 및 배포/재배포는 이용약관과 관련 법령에 의거하여 엄격히 금지되어있고, 민/형사상 처벌의 대상이 됩니다.";

  const isOwnPost =
    user?.attributes?.preferred_username === post.creator.handle;

  return {
    user,
    router,
    isMobile,
    isTablet,
    isDesktop,
    showComments,
    setShowComments,
    commentCount,
    setCommentCount,
    lightboxOpen,
    setLightboxOpen,
    lightboxIndex,
    getLightboxSlides,
    handleThumbnailClick,
    noCopyGuideText,
    isOwnPost,
  };
}
