"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spin, Alert } from "antd";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function AuthGuard({
  children,
  fallback,
  redirectTo = "/",
  requireAuth = true,
}: AuthGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 인증이 필요한 페이지인지 확인
    if (!requireAuth) return;

    // 로딩 중이면 대기
    if (user === undefined) return;

    // 로그아웃 상태면 리디렉트
    if (user === null) {
      setIsRedirecting(true);
      router.push(redirectTo);
      return;
    }

    // 로그인 상태면 리디렉트 상태 해제
    setIsRedirecting(false);
  }, [user, router, redirectTo, requireAuth]);

  // 로딩 중
  if (user === undefined) {
    return (
      fallback || (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Spin size="large" />
          <div>인증 확인 중...</div>
        </div>
      )
    );
  }

  // 인증이 필요하지 않은 페이지
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 로그아웃 상태 (리디렉트 중)
  if (user === null || isRedirecting) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <Spin size="large" />
        <div>로그인이 필요합니다. 로그인 페이지로 이동 중...</div>
      </div>
    );
  }

  // 로그인 상태 - 정상 렌더링
  return <>{children}</>;
}
