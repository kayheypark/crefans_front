"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRouteProps } from "@/features/auth-protected-route/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useProtectedRouteModel({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { user } = useAuth();

  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    // 로그인 후 원래 페이지로 리디렉트
    if (user && searchParams.get("redirect")) {
      const redirectPath = searchParams.get("redirect");
      if (redirectPath) {
        router.replace(redirectPath);
      }
    }
  }, [user, router, searchParams]);

  return {};
}
