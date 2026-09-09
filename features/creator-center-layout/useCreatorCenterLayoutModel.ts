"use client";

import { useAuth } from "@/contexts/AuthContext";
import { CreatorCenterLayoutProps } from "@/features/creator-center-layout/types";
import { useResponsive } from "@/hooks/useResponsive";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function useCreatorCenterLayoutModel({
  children,
}: CreatorCenterLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const { user, logout } = useAuth();

  const router = useRouter();

  const pathname = usePathname();

  const { isMobile, isTablet } = useResponsive();

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
    // 모바일/태블릿에서 메뉴 클릭 시 사이드바 닫기
    if (isMobile || isTablet) {
      setCollapsed(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleBackToCrefans = () => {
    router.push("/");
  };

  return {
    collapsed,
    setCollapsed,
    user,
    pathname,
    isMobile,
    isTablet,
    handleMenuClick,
    handleLogout,
    handleBackToCrefans,
  };
}
