"use client";

import React, { useState, useEffect } from "react";
import { Button, message } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { followApi } from "@/lib/api/follow";
import { useAuth } from "@/contexts/AuthContext";

export interface FollowButtonProps {
  /** 팔로우 대상 사용자의 ID */
  targetUserId: string;
  /** 현재 팔로우 상태 */
  isFollowing: boolean;
  /** 버튼 타입: 'follow' | 'following' | 'auto' */
  buttonType?: "follow" | "following" | "auto";
  /** 버튼 크기 */
  size?: "small" | "middle" | "large";
  /** 버튼 스타일 */
  style?: React.CSSProperties;
  /** 팔로우 상태 변경 콜백 */
  onFollowChange?: (isFollowing: boolean) => void;
  /** 팔로워 수 변경 콜백 (선택사항) */
  onFollowerCountChange?: (delta: number) => void;
  /** 로그인 모달 열기 콜백 */
  onLoginRequired?: () => void;
  /** 커스텀 클래스명 */
  className?: string;
  /** 본인 계정인지 여부 (본인인 경우 버튼 숨김) */
  isOwnAccount?: boolean;
}

/**
 * 팔로우/언팔로우 버튼 컴포넌트
 *
 * 사용 시나리오:
 * 1. 프로필 페이지 - 메인 팔로우 버튼: buttonType="auto"
 * 2. 프로필 페이지 - 팔로잉 탭 버튼: buttonType="following"
 * 3. 프로필 페이지 - 팔로워 탭 버튼: buttonType="follow"
 */
export default function FollowButton({
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
}: FollowButtonProps) {
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

  // 본인 계정인 경우 버튼을 렌더링하지 않음
  if (isOwnAccount) {
    return null;
  }

  // 버튼 타입에 따른 표시 텍스트와 스타일 결정
  const getButtonConfig = () => {
    const isCurrentlyFollowing = currentFollowing;

    if (buttonType === "following") {
      // 팔로잉 탭에서 사용: 언팔로우 버튼
      return {
        text: "팔로잉",
        icon: <HeartFilled />,
        type: "primary" as const,
        ghost: true,
        style: {
          color: "#ff4d4f",
          borderColor: "#ff4d4f",
          backgroundColor: "transparent",
          ...style,
        },
      };
    } else if (buttonType === "follow") {
      // 팔로워 탭에서 사용: 팔로우 버튼
      return {
        text: "팔로우",
        icon: <HeartOutlined />,
        type: "primary" as const,
        ghost: false,
        style: {
          backgroundColor: "#ff4d4f",
          borderColor: "#ff4d4f",
          color: "#ffffff",
          ...style,
        },
      };
    } else {
      // 자동 감지: 현재 상태에 따라 결정 (메인 프로필 버튼용)
      return {
        text: isCurrentlyFollowing ? "팔로우 취소" : "팔로우",
        icon: isCurrentlyFollowing ? <HeartFilled /> : <HeartOutlined />,
        type: "primary" as const,
        ghost: isCurrentlyFollowing,
        style: {
          backgroundColor: isCurrentlyFollowing ? "transparent" : "#ff4d4f",
          borderColor: "#ff4d4f",
          color: isCurrentlyFollowing ? "#ff4d4f" : "#ffffff",
          ...style,
        },
      };
    }
  };

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
          newFollowingState ? "팔로우했습니다." : "팔로우를 취소했습니다."
        );
      } else {
        throw new Error(response.message || "팔로우 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("팔로우 처리 실패:", error);
      message.error(
        error instanceof Error ? error.message : "팔로우 처리에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <Button
      type={buttonConfig.type}
      ghost={buttonConfig.ghost}
      icon={buttonConfig.icon}
      size={size}
      loading={loading}
      onClick={handleFollowToggle}
      style={buttonConfig.style}
      className={className}
    >
      {buttonConfig.text}
    </Button>
  );
}
