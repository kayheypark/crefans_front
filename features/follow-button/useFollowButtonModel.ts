"use client";
import type { Feedback } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { FollowButtonProps } from "@/features/follow-button/types";
import { followApi } from "@/lib/api/follow";
import { useEffect, useState } from "react";

export function useFollowButtonModel(
  {
    targetUserId,
    isFollowing,
    buttonType = "auto",
    size = "middle",
    style,
    onFollowChange,
    onFollowerCountChange,
    onLoginRequired,
    className,
    isOwnAccount = false,
  }: FollowButtonProps,
  { message }: { message: Feedback },
) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [currentFollowing, setCurrentFollowing] = useState(isFollowing);

  // user 상태 또는 isFollowing prop 변화 감지
  useEffect(() => {
    if (!user) {
      // 로그아웃 시 팔로우 상태를 false로 초기화
      setCurrentFollowing(false);
    } else {
      // 로그인 상태이고 isFollowing prop이 변경된 경우 업데이트
      setCurrentFollowing(isFollowing);
    }
  }, [user, isFollowing]);

  const handleFollowToggle = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }

    if (!targetUserId) {
      message.error("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const response = currentFollowing
        ? await followApi.unfollowUser(targetUserId)
        : await followApi.followUser(targetUserId);

      if (response.success) {
        const newFollowingState = !currentFollowing;
        setCurrentFollowing(newFollowingState);

        // 콜백 함수들 호출
        onFollowChange?.(newFollowingState);
        onFollowerCountChange?.(newFollowingState ? 1 : -1);

        message.success(
          newFollowingState ? "팔로우했습니다." : "팔로우를 취소했습니다.",
        );
      } else {
        throw new Error(response.message || "팔로우 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("팔로우 처리 실패:", error);
      message.error(
        error instanceof Error ? error.message : "팔로우 처리에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, currentFollowing, handleFollowToggle };
}
