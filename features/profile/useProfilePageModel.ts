"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useProfilePageModel() {
  const { user } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (user?.attributes?.preferred_username) {
      // 본인 프로필인 경우 /@handle로 리다이렉트
      router.replace(`/@${user.attributes.preferred_username}`);
    } else if (user === null) {
      // 로그인하지 않은 경우 홈으로 리다이렉트
      router.replace("/");
    }
  }, [user, router]);

  return {};
}
