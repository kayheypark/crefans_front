"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useLoginPageModel() {
  const { user } = useAuth();

  const router = useRouter();

  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "/";

  // 이미 로그인된 사용자라면 리다이렉트
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleLogin = () => {
    // 여기서는 간단히 홈으로 이동하도록 처리
    // 실제로는 LoginModal을 열거나 다른 로그인 프로세스를 실행해야 함
    router.push("/");
  };

  return { user, router, handleLogin };
}
