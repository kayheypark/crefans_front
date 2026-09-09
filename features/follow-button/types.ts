import React from "react";
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
