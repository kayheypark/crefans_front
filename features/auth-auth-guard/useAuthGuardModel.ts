"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthGuardProps } from "@/features/auth-auth-guard/types";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuthGuardModel({
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

  return { user, isRedirecting };
}
