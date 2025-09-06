"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  onUnauthorized?: () => void;
}

export function useAuthGuard({
  redirectTo = "/",
  requireAuth = true,
  onUnauthorized,
}: UseAuthGuardOptions = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!requireAuth) {
      setIsAuthorized(true);
      return;
    }

    if (user === undefined) {
      setIsAuthorized(null); // 로딩 중
      return;
    }

    if (user === null) {
      setIsAuthorized(false);
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        router.push(redirectTo);
      }
      return;
    }

    setIsAuthorized(true);
  }, [user, router, redirectTo, requireAuth, onUnauthorized]);

  return {
    isAuthorized,
    isLoading: isAuthorized === null,
    user,
  };
}
