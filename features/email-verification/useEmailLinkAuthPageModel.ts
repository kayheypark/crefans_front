"use client";

import { authAPI } from "@/lib/api/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useEmailLinkAuthPageModel() {
  const searchParams = useSearchParams();

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState(5);

  const email = searchParams.get("email");

  const code = searchParams.get("code");

  useEffect(() => {
    const confirmEmailVerification = async () => {
      if (!email || !code) {
        setError("이메일과 인증 코드가 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.confirmEmailVerification(email, code);

        if (response.success) {
          setSuccess(true);
        } else {
          setError(response.message || "인증에 실패했습니다.");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "이메일 인증 중 오류가 발생했습니다.",
        );
      } finally {
        setLoading(false);
      }
    };

    confirmEmailVerification();
  }, [email, code]);

  // 카운트다운 타이머
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      router.push("/");
    }
  }, [success, countdown, router]);

  const handleGoToHome = () => {
    router.push("/");
  };

  return { loading, success, error, countdown, handleGoToHome };
}
