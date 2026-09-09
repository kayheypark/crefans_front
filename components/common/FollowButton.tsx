"use client";
import { message as uiMessage } from "antd";

import { FollowButtonProps } from "@/features/follow-button/types";
import { useFollowButtonModel } from "@/features/follow-button/useFollowButtonModel";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default function FollowButton(props: FollowButtonProps) {
  const model = useFollowButtonModel(props, { message: uiMessage });
  return <FollowButtonView {...props} model={model} />;
}

function FollowButtonView({
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
  model,
}: FollowButtonProps & { model: ReturnType<typeof useFollowButtonModel> }) {
  const { loading, currentFollowing, handleFollowToggle } = model;

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
