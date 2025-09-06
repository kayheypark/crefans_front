"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "./AuthGuard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
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

  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}
